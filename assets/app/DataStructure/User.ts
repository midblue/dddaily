import moment from 'moment'
import type { Moment } from 'moment'

import * as c from '~/common'
import { Activity } from './Activity'
import { Entity } from './Entity'
import { networkCheck } from '../appState'

// const maxFreebies = 3

export class User extends Entity {
  type: EntityType = 'User'
  activities: Activity[]
  activityIdOrder: string[]
  /** in old-to-new order */
  clears: DatedResults = []
  // freebiesAvailable: number = 0

  private currentDay: DateString = c.dateString()

  constructor(data: UserConstructorData) {
    super(data)

    this.activities = []
    for (let a of data.activityConstructors || []) {
      this.addActivityFromConstructorData(a)
    }

    this.activityIdOrder = data.activityIdOrder || []
    this.activities = this.activities.sort(
      (a, b) =>
        this.getActivityOrderIndex(a) -
        this.getActivityOrderIndex(b),
    )
    this.updateActivityOrder()

    this.clears = data.clears || []
    // this.freebiesAvailable = data.freebiesAvailable || 0

    this.passiveReset()
  }

  override getSaveableData(): UserConstructorData {
    return {
      ...super.getSaveableData(),
      activityIdOrder: this.activityIdOrder,
      clears: this.clears,
      // freebiesAvailable: this.freebiesAvailable,
    }
  }

  override async passiveReset() {
    if (!(await networkCheck())) return

    const newDay = c.dateString()
    if (newDay !== this.currentDay) {
      this.currentDay = newDay
      this.dailyReset()
    }

    this.activities.forEach((activity) =>
      activity.passiveReset(),
    )

    this.bringClearsUpToDate()

    super.passiveReset()

    this.callHook('afterPassiveUpdate')
  }

  override dailyReset() {
    c.log('dailyReset')

    this.activities.forEach((activity) =>
      activity.dailyReset(),
    )

    this.bringClearsUpToDate()

    // this.checkUseFreebie()

    super.dailyReset()

    this.forgiveNonessentialActivitiesFromYesterday()

    this.callHook('afterDailyUpdate')
  }

  bringClearsUpToDate(): void {
    if (!this.activities.length) return
    const { clears, didChange } = c.getUpdatedClears(
      this.clears,
    )
    if (didChange) {
      this.clears = clears
      this.save(['clears'])
    }
  }

  // checkUseFreebie() {
  //   if (
  //     this.yesterday &&
  //     !this.didClearOnDay(this.yesterday) &&
  //     this.freebiesAvailable > 0
  //   ) {
  //     c.log(
  //       'using freebie for yesterday:',
  //       this.yesterday.date,
  //       this.yesterday.acceptableEffort,
  //       this.yesterday.effortExpended,
  //     )
  //     this.freebiesAvailable--
  //     this.save(['freebiesAvailable'])
  //     this.yesterday.usedFreebie = true
  //     this.save(['clears'])
  //   }
  // }

  forgiveNonessentialActivitiesFromYesterday() {
    if (this.yesterday) {
      const yesterdayDate = moment(this.yesterday.date)

      for (let a of Object.keys(this.yesterday.clears)) {
        const activity = this.getActivityById(a)
        if (!activity) continue
        if (this.yesterday.clears[a] > 0) continue
        if (activity.exact || !activity.lastDone) continue
        // for instances where the gap is less than streakLeewayEitherDirection, remove 0s (fails)
        const lastDone = moment(activity.lastDone)
        const daysSinceLastDone = c.daysBetween(
          lastDone,
          yesterdayDate,
        )
        const streakLeewayEitherDirection =
          activity.streakLeewayEitherDirection
        if (
          daysSinceLastDone <= streakLeewayEitherDirection
        ) {
          c.log('forgiving', activity.name)
          delete this.yesterday.clears[a]
        }
      }
    }

    this.save(['clears'])
  }

  setMood(mood: number, day = moment()) {
    const date = c.dateString(day)
    const results = this.getDay(date, { upsert: true })
    if (!results) return
    if (results.mood === mood) return
    results.mood = mood
    this.save(['clears'])
  }

  setEnergy(energy: number, day = moment()) {
    const date = c.dateString(day)
    const results = this.getDay(date, { upsert: true })
    if (!results) return
    if (results.energy === energy) return
    results.energy = energy
    this.save(['clears'])
  }

  getStreak(): number {
    let streak = 0
    const clearsLength = this.clears.length
    for (let i = clearsLength - 1; i >= 0; i--) {
      const clear = this.clears[i]
      if (this.didClearOnDay(clear.date)) streak++
      else break
    }
    return streak
  }

  getEffortBudget(passedDay?: Moment | DateString): number {
    const day = moment(passedDay)
    // * minimum is sum effort cost of exact and due now activities
    // * "if you do nothing else today, at least do these."
    const minimumEffortBudget = this.activities.reduce(
      (a, b) => a + (b.dueness > 2 ? b.effortRequired : 0),
      0,
    )

    const getEffortUsageFromDayData = (
      dayData: DatedResults[0],
    ): number =>
      Object.keys(dayData.clears || {})
        .filter((key) => dayData.clears![key] > 0)
        .map(
          (activityId) =>
            this.getActivityById(activityId)
              ?.effortRequired || 0,
        )
        .reduce((a, b) => a + b, 0) || 1

    // c.log({
    //   minimumEffortBudget,
    //   rawMaximumEffortBudget,
    //   maximumEffortBudget,
    //   effortBudget,
    //   previousDayEffortUsage,
    // })

    const energyToday = this.today?.energy || 0.5

    const getEffortUsageAsPercentOfAcceptableFromDayData = (
      dayData: DatedResults[0],
    ): number =>
      getEffortUsageFromDayData(dayData) /
      (dayData.acceptableEffort || 1)

    const previousDays = [
      this.getDay(c.addDaysToDate(day, -1)),
      this.getDay(c.addDaysToDate(day, -2)),
      this.getDay(c.addDaysToDate(day, -3)),
    ].filter((d) => !!d) as DatedResults[0][]
    if (!previousDays.length) return minimumEffortBudget

    const previousDayAverageEffortUsage = c.r2(
      previousDays.reduce(
        (a, b) =>
          a +
          getEffortUsageFromDayData(b) /
            previousDays.length,
        0,
      ),
    )
    const previousDayAverageEffortAsPercentOfAcceptable =
      c.r2(
        previousDays.reduce(
          (a, b) =>
            a +
            getEffortUsageAsPercentOfAcceptableFromDayData(
              b,
            ) /
              previousDays.length,
          0,
        ),
      )
    const effortBudget = c.r2(
      minimumEffortBudget +
        Math.max(
          0,
          previousDayAverageEffortUsage -
            minimumEffortBudget * 0.7,
        ) *
          energyToday *
          previousDayAverageEffortAsPercentOfAcceptable,
    )
    c.log('getEffortBudget result', {
      minimumEffortBudget,
      previousDayAverageEffortUsage,
      previousDayAverageEffortAsPercentOfAcceptable,
      energyToday,
      effortBudget,
    })

    return effortBudget
  }

  /** just loads them, not generate */
  getActivitiesForDay(
    day: Moment | DateString,
  ): Activity[] {
    const results = this.getDay(day || c.dateString(), {
      upsert: true,
    })
    if (!results) return []
    const activities: Activity[] = []
    for (let id in results.clears) {
      const activity = this.getActivityById(id)
      if (activity) activities.push(activity)
    }
    return activities
  }
  /** just loads them, not generate */
  getBackupActivitiesForDay(
    day?: Moment | DateString,
  ): Activity[] {
    const results = this.getDay(day || c.dateString(), {
      upsert: true,
    })
    if (!results) return []
    const activities: Activity[] = []
    for (let id of results.backupActivityIds || []) {
      const activity = this.getActivityById(id)
      if (activity) activities.push(activity)
    }
    return activities
  }

  assignActivitiesForDay(
    day?: Moment | DateString,
    forceOverwrite = false,
  ): Activity[] {
    const results = this.getDay(day || c.dateString(), {
      upsert: true,
    })
    if (!results) return []
    // * skip if already assigned
    if (
      !forceOverwrite &&
      Object.keys(results.clears).length
    )
      return []
    results.clears = {}

    const { activities, backups } =
      this.generateActivitiesForDay(day)
    for (let activity of activities) {
      results.clears[activity.id] = 0
    }
    const maxEffort = c.r2(
      activities.reduce((a, b) => a + b.effortRequired, 0),
    )
    results.maxEffort = maxEffort
    const acceptableEffort = getAcceptableEffort(
      results.energy,
      activities,
    )
    c.log('assignActivtiesForDay calc:', {
      acceptableEffort,
      maxEffort,
      r: acceptableEffort / (maxEffort || 1),
    })
    results.acceptableEffort = acceptableEffort
    results.effortExpended = 0
    results.backupActivityIds = backups.map((a) => a.id)

    this.save(['clears'])
    return activities
  }

  private generateActivitiesForDay(
    day?: Moment | DateString,
  ): {
    activities: Activity[]
    backups: Activity[]
  } {
    const effortBudget = this.getEffortBudget(day)
    const moodYesterday =
      this.getDay(c.addDaysToDate(day, -1), {
        upsert: true,
      })?.mood || 5
    const energyToday =
      this.getDay(day || c.dateString(), { upsert: true })
        ?.energy || 5
    const activitiesToDo: Activity[] = []

    const activitiesByScore = this.activities.map((a) => {
      // * score system here! consider extracting
      let score = 0

      // dueness
      const dueness = a.dueness
      score += dueness

      // mood range
      const isWithinMoodRange =
        moodYesterday >= a.moodLowLimit &&
        moodYesterday <= a.moodHighLimit
      const activityMoodCenter =
        (a.moodLowLimit + a.moodHighLimit) / 2
      const activityMoodRange =
        a.moodHighLimit - a.moodLowLimit || 1
      const moodDistance = Math.abs(
        moodYesterday - activityMoodCenter,
      )
      /** -x to 1 */
      const moodFit = 1 - moodDistance / activityMoodRange
      score += isWithinMoodRange ? moodFit : 0

      // energy range
      const effortRequired = a.effortRequired
      const energyDistance = effortRequired - energyToday
      const energyFit = 1 - energyDistance
      score += energyFit

      // random
      // score += Math.random() * 0.3

      // c.log('activitiesByScore calc', {
      //   name: a.name,
      //   score,
      //   dueness,
      //   moodFit,
      //   energyFit,
      // })

      return {
        score,
        activity: a,
      }
    })
    activitiesByScore.sort((a, b) => b.score - a.score)

    c.log('activitiesByScore calc', {
      activitiesByScore,
      effortBudget,
    })

    let currentEnergyUsage = 0
    let index = 0
    let alreadyHasBigOne = false
    let backupActivities: Activity[] = []
    while (index < activitiesByScore.length) {
      const a = activitiesByScore[index]
      index++

      const mustBeDoneToday = a.activity.dueness > 2
      const isBigOne =
        a.activity.dayInterval >= 14 &&
        a.activity.effortRequired >= 0.4
      if (
        !mustBeDoneToday &&
        isBigOne &&
        alreadyHasBigOne
      ) {
        if (a.activity.dueness > 0.49)
          backupActivities.push(a.activity)
        continue
      }
      if (isBigOne) alreadyHasBigOne = true

      // * don't assign if it's over the budget
      if (
        currentEnergyUsage > effortBudget &&
        !mustBeDoneToday
      ) {
        // * but if it's semi close to due, add it to the backup list
        if (a.activity.dueness > 0.5)
          backupActivities.push(a.activity)
        continue
      }

      // * don't assign if it's not even close to due
      if (a.activity.dueness < 0.4) continue

      activitiesToDo.push(a.activity)
      currentEnergyUsage += a.activity.effortRequired
      c.log(
        `added activity ${a.activity.name} score ${a.score} and energy cost ${a.activity.effortRequired}, current energy usage ${currentEnergyUsage}/${effortBudget}`,
      )
    }

    if (activitiesToDo.length === 0) {
      c.log(
        'no activities to do, adding first one',
        backupActivities,
      )
      if (activitiesByScore[0].activity) {
        activitiesToDo.push(activitiesByScore[0].activity)
      }
      if (backupActivities.includes(activitiesToDo[0]))
        backupActivities = backupActivities.filter(
          (a) => a !== activitiesToDo[0],
        )
    }

    const sortedByOrder: Activity[] = []
    for (let id of this.activityIdOrder)
      if (activitiesToDo.find((a) => a.id === id))
        sortedByOrder.push(
          activitiesToDo.find((a) => a.id === id)!,
        )

    return {
      activities: sortedByOrder,
      backups: backupActivities,
    }
  }

  swapActivityOnDay(
    day: Moment | DateString = moment(),
    activityId: string,
  ) {
    if (typeof day === 'string') day = moment(day)
    const results = this.getDay(day, { upsert: true })
    if (!results) return
    const activity = this.getActivityById(activityId)
    if (!activity) return
    const backupActivityId = results.backupActivityIds?.[0]
    if (!backupActivityId) return
    const backupActivity = this.getActivityById(
      backupActivityId,
    )
    if (!backupActivity) return

    c.log(
      'swapping',
      activity.name,
      'with',
      backupActivity.name,
    )
    results.clears[backupActivityId] = 0
    delete results.clears[activityId]
    results.backupActivityIds = (
      results.backupActivityIds || []
    ).filter((id) => id !== backupActivityId)
    results.backupActivityIds.push(activityId)

    results.maxEffort = c.r2(
      Object.keys(results.clears)
        .map((cl) => this.getActivityById(cl))
        .filter((a) => a)
        .reduce((a, b) => a + (b?.effortRequired || 0), 0),
    )
    this.save(['clears'])
  }

  addActivityOnDay(
    day: Moment | DateString = moment(),
    specificActivity?: Activity,
  ): boolean {
    c.log('addActivityOnDay')
    if (typeof day === 'string') day = moment(day)
    const results = this.getDay(day, { upsert: true })
    if (!results) return false
    let chosenActivity: Activity | null =
      specificActivity || null
    if (!chosenActivity) {
      chosenActivity = this.getActivityById(
        results.backupActivityIds?.[0],
      )
      if (!chosenActivity) {
        // * if there's no backup activity, just pick a random one that we don't already have
        const existing = this.getActivitiesForDay(day)
        const remaining = this.activities.filter(
          (a) => !existing.includes(a),
        )
        // c.log(
        //   this.activities.length,
        //   remaining.length,
        //   this.activities.length,
        // )
        if (!remaining.length) return false
        chosenActivity = c.randomFromArray(remaining)
      }
      if (!chosenActivity) return false
    }

    results.clears[chosenActivity.id] = 0

    results.backupActivityIds = (
      results.backupActivityIds || []
    ).filter((id) => id !== chosenActivity?.id)

    results.maxEffort = c.r2(
      Object.keys(results.clears)
        .map((cl) => this.getActivityById(cl))
        .filter((a) => a)
        .reduce((a, b) => a + (b?.effortRequired || 0), 0),
    )
    this.save(['clears'])
    return true
  }

  getDay(
    day: DateString | Moment | DatedResults[0] | null,
    { upsert }: { upsert: boolean } = { upsert: false },
  ): DatedResults[0] | null {
    if (!day) return null
    if ((day as DatedResults[0]).clears)
      return day as DatedResults[0]

    let dateString: DateString
    if (day instanceof Date) dateString = c.dateString(day)
    else if ((day as Moment).daysInMonth)
      dateString = c.dateString(day as Moment)
    else dateString = c.dateString(day as any)
    const found =
      this.clears.find((c) => c.date === dateString) || null
    if (found) return found
    if (!upsert) return null

    c.log(
      'creating new day results for day',
      day,
      dateString,
    )
    c.trace()

    const newDayData: DatedResults[0] = {
      date: dateString,
      clears: {},
    }
    // insert in proper order
    const newClears = [...this.clears]
    newClears.push(newDayData)
    newClears.sort((a, b) => a.date.localeCompare(b.date))
    this.clears = newClears
    this.save(['clears'])

    return newDayData
  }
  get today(): DatedResults[0] | null {
    const currentDate = c.dateString()
    return (
      this.clears.find((c) => c.date === currentDate) ||
      null
    )
  }
  get yesterday(): DatedResults[0] | null {
    const yesterday = c.dateString(
      c.addDaysToDate(moment(), -1),
    )
    return (
      this.clears.find((c) => c.date === yesterday) || null
    )
  }
  getDaysWhere({
    filter,
    limit,
    order,
  }: {
    filter: (d: DatedResults[0]) => boolean
    limit?: number
    order?: 'asc' | 'desc'
  }): DatedResults[0][] | null {
    const results: DatedResults[0][] = []
    for (
      let i = order === 'asc' ? 0 : this.clears.length - 1;
      order === 'asc' ? i < this.clears.length : i >= 0;
      order === 'asc' ? i++ : i--
    ) {
      const day = this.clears[i]
      if (filter(day)) results.push(day)
      if (results.length === limit) break
    }
    return results.length ? results : null
  }

  addActivityFromConstructorData(
    data: ActivityConstructorData,
    save = false,
  ): Activity | null {
    const activity = new Activity(data, this)
    this.activities.push(activity)
    if (save) {
      activity.save()
      this.activityIdOrder.push(activity.id)
      this.save(['activityIdOrder'])
    }
    return activity
  }

  removeActivity(activity: Activity): boolean {
    const found = this.activities.find(
      (a) => a === activity,
    )
    if (!found) return false
    this.activities = this.activities.filter(
      (a) => a !== activity,
    )
    activity.remove()

    this.updateActivityOrder()

    return true
  }

  private updateActivityOrder() {
    if (
      this.activityIdOrder.length !== this.activities.length
    ) {
      this.activityIdOrder = this.activities.map(
        (a) => a.id,
      )
      this.save(['activityIdOrder'])
    }
  }

  getActivityById(id?: string): Activity | null {
    return this.activities.find((a) => a.id === id) || null
  }

  getActivityOrderIndex(activity: Activity): number {
    return this.activityIdOrder.findIndex(
      (a) => a === activity.id,
    )
  }

  get orderedActivities(): Activity[] {
    return this.activityIdOrder
      .map((id) => this.getActivityById(id))
      .filter((a) => !!a) as Activity[]
  }

  getNextEntry(
    date: DateString | Moment,
  ): DatedResults[0] | null {
    const found = this.getDay(date)
    if (found) {
      const index = this.clears.indexOf(found)
      return this.clears[index + 1] || null
    }
    return null
  }

  getPreviousEntry(
    date: DateString | Moment,
  ): DatedResults[0] | null {
    const found = this.getDay(date)
    if (found) {
      const index = this.clears.indexOf(found)
      // c.log(index, JSON.stringify(this.clears[index - 1]))
      return this.clears[index - 1] || null
    }
    return null
  }

  moveActivity(activity: Activity, relativeIndex: number) {
    const foundIndex = this.activityIdOrder.findIndex(
      (a) => a === activity.id,
    )
    // c.log('moveActivity', foundIndex, relativeIndex)
    if (foundIndex === -1) return false
    let newIndex = c.clamp(
      0,
      foundIndex + relativeIndex,
      this.activityIdOrder.length - 1,
    )
    if (newIndex === foundIndex) return false

    const newOrder = [...this.activityIdOrder]
    newOrder.splice(foundIndex, 1)
    newOrder.splice(newIndex, 0, activity.id)
    this.activityIdOrder = newOrder
    this.save(['activityIdOrder'])

    return true
  }

  didClearOnDay(
    day:
      | DateString
      | Moment
      | DatedResults[0]
      | undefined
      | null = c.dateString(),
  ): boolean {
    const found = this.getDay(day)
    if (!found) return false

    // c.log(
    //   found,
    //   (found.effortExpended || 0) >=
    //     (found.acceptableEffort || -1),
    // )

    // * VESTIGIAL! we count days where the user used a freebie as cleared
    const usedFreebie = (found as any).usedFreebie

    // * we count days where the user matched the acceptable effort as cleared
    const clearedAcceptableEffort =
      !!found.maxEffort &&
      (found.effortExpended || 0) >=
        (found.acceptableEffort || -1)

    // * we also count days where the list was never generated as cleared
    // but not days older than the oldest entry, handled by found check above
    const noActivitiesForDay =
      Object.keys(found.clears).length === 0

    return (
      usedFreebie ||
      clearedAcceptableEffort ||
      noActivitiesForDay
    )
  }
  didMaxClearOnDay(
    day:
      | DateString
      | Moment
      | DatedResults[0]
      | undefined
      | null = c.dateString(),
  ): boolean {
    const found = this.getDay(day)
    if (!found) return false

    if (!Object.keys(found.clears).length) return false
    return (
      !!found.maxEffort &&
      (found.effortExpended || 0) >= (found.maxEffort || -1)
    )
  }

  clearActivity(
    activity: Activity,
    day = c.dateString(),
    setTo: Clear = 1,
  ) {
    const dayWasAlreadyCleared = this.didClearOnDay(day)

    const results = this.getDay(day, { upsert: true })
    if (!results) return
    const activitiesForDay = this.getActivitiesForDay(
      moment(day),
    )
    results.clears[activity.id] = setTo
    results.effortExpended = c.r2(
      activitiesForDay
        .filter((a) => a.didClearOnDay(moment(day)))
        .reduce((a, b) => a + b.effortRequired, 0),
    )

    // // * in the case that you check things off later on, refund freebies if necessary
    // if (
    //   results.usedFreebie &&
    //   results.effortExpended >=
    //     (results.acceptableEffort || Infinity)
    // ) {
    //   results.usedFreebie = false
    //   this.freebiesAvailable = c.clamp(
    //     0,
    //     this.freebiesAvailable + 1,
    //     maxFreebies,
    //   )
    // }

    if (!dayWasAlreadyCleared && this.didClearOnDay(day)) {
      c.log('achieved goal!')
    }

    if (
      results.effortExpended >=
        (results.maxEffort || 10000) &&
      Object.entries(results.clears).every(
        ([a, b]) => b === 1,
      )
    ) {
      c.log('full clear!')

      // if (
      //   !results.awardedFreebie &&
      //   this.freebiesAvailable < maxFreebies
      // ) {
      //   results.awardedFreebie = true
      //   this.freebiesAvailable = c.clamp(
      //     0,
      //     this.freebiesAvailable + 1,
      //     maxFreebies,
      //   )
      // }
    }

    this.save(['clears'])
  }

  get oldestEntry(): DatedResults[0] | null {
    return this.clears[0] || null
  }
}

function getAcceptableEffort(
  /** 0-1 */
  energy: number = 0.5,
  activities: Activity[],
) {
  const totalEffort = c.r2(
    activities.reduce((a, b) => a + b.effortRequired, 0),
  )
  const dueActivities = activities.filter(
    (a) => a.dueness > 1,
  )
  const dueActivitiesEffort = c.r2(
    dueActivities.reduce((a, b) => a + b.effortRequired, 0),
  )
  const optionalEffort = c.r2(
    totalEffort - dueActivitiesEffort,
  )
  const optionalRatio = c.clamp(
    0,
    optionalEffort / (dueActivitiesEffort || 0.001),
    1,
  )
  const acceptableEffort = c.r2(
    Math.min(
      Math.max(
        Math.min(
          dueActivitiesEffort +
            optionalEffort *
              // turns down the optional requirement if there are many due activities
              optionalRatio *
              (energy * 0.5),
          totalEffort * 0.9,
        ),
        totalEffort * (0.3 + energy * 0.5),
      ),
      totalEffort,
    ),
  )
  c.log('getAcceptableEffort result:', {
    totalEffort,
    dueActivitiesEffort,
    optionalEffort,
    optionalRatio,
    acceptableEffort,
  })
  return acceptableEffort

  // ((energy || 0.5) * 0.7) / 2 + 0.5)
}
