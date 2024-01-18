import * as c from '~/../../common'
import { Activity } from './Activity'
import { Entity } from './Entity'

export class User extends Entity {
  type: EntityType = 'User'
  activities: Activity[]
  activityIdOrder: string[]
  clears: DatedResults = []

  private currentDay: DateString = c.dateToDateString()
  private dailyHooks: (() => void)[] = []
  private passiveHooks: (() => void)[] = []

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

    this.passiveReset()
  }

  passiveReset() {
    const newDay = c.dateToDateString()
    if (newDay !== this.currentDay) {
      this.currentDay = newDay
      this.dailyReset()
    }

    this.activities.forEach((activity) =>
      activity.passiveReset(),
    )

    this.bringClearsUpToDate()

    super.passiveReset()

    for (let hook of this.passiveHooks) {
      hook()
    }
  }
  addPassiveHook(hook: () => void) {
    this.passiveHooks.push(hook)
  }

  dailyReset() {
    this.activities.forEach((activity) =>
      activity.dailyReset(),
    )

    this.bringClearsUpToDate()

    super.dailyReset()

    for (let hook of this.dailyHooks) {
      hook()
    }
  }
  addDailyHook(hook: () => void) {
    this.dailyHooks.push(hook)
  }

  getSaveableData(): UserConstructorData {
    return {
      ...super.getSaveableData(),
      activityIdOrder: this.activityIdOrder,
      clears: this.clears,
    }
  }

  setMood(mood: number, day = new Date()) {
    const date = c.dateToDateString(day)
    const results = this.getResultsForDay(date)
    if (!results) return
    if (results.mood === mood) return
    results.mood = mood
    this.save(['clears'])
  }

  setEnergy(energy: number, day = new Date()) {
    const date = c.dateToDateString(day)
    const results = this.getResultsForDay(date)
    if (!results) return
    if (results.energy === energy) return
    results.energy = energy
    this.save(['clears'])
  }

  getStreak(): number {
    let streak = 0
    for (let i = this.clears.length - 1; i >= 0; i--) {
      const clear = this.clears[i]
      if (this.didClearOnDay(clear.date)) streak++
      else break
    }
    return streak
  }

  getEffortBudget(day = new Date()): number {
    // * minimum is all exact due things, plus .5 to let in at least one or two more things
    // * so we don't end up with a day of nothing but exact daily things
    const minimumEffortBudget =
      this.activities.reduce(
        (a, b) =>
          a + (b.dueness > 2 ? b.effortRequired : 0),
        0,
      ) + 0.5

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
    const energyToday = this.today?.energy || 0.5
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
    c.log({
      minimumEffortBudget,
      previousDayAverageEffortUsage,
      previousDayAverageEffortAsPercentOfAcceptable,
      energyToday,
      effortBudget,
    })
    return effortBudget
  }

  /** just loads them, not generate */
  getActivitiesForDay(day = new Date()): Activity[] {
    const date = c.dateToDateString(day)
    const results = this.getResultsForDay(date)
    if (!results) return []
    const activities: Activity[] = []
    for (let id in results.clears) {
      const activity = this.getActivityById(id)
      if (activity) activities.push(activity)
    }
    return activities
  }
  /** just loads them, not generate */
  getBackupActivitiesForDay(day = new Date()): Activity[] {
    const date = c.dateToDateString(day)
    const results = this.getResultsForDay(date)
    if (!results) return []
    const activities: Activity[] = []
    for (let id of results.backupActivityIds || []) {
      const activity = this.getActivityById(id)
      if (activity) activities.push(activity)
    }
    return activities
  }

  assignActivitiesForDay(
    day = new Date(),
    forceOverwrite = false,
  ): Activity[] {
    const date = c.dateToDateString(day)
    const results = this.getResultsForDay(date)
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
    c.log({
      acceptableEffort,
      maxEffort,
      r: acceptableEffort / maxEffort,
    })
    results.acceptableEffort = acceptableEffort
    results.effortExpended = 0
    results.backupActivityIds = backups.map((a) => a.id)

    this.save(['clears'])
    return activities
  }

  private generateActivitiesForDay(day = new Date()): {
    activities: Activity[]
    backups: Activity[]
  } {
    const effortBudget = this.getEffortBudget(day)
    const moodYesterday =
      this.getResultsForDay(
        c.dateToDateString(c.addDaysToDate(day, -1)),
      )?.mood || 5
    const energyToday =
      this.getResultsForDay(c.dateToDateString(day))
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

      c.log({
        name: a.name,
        score,
        dueness,
        moodFit,
        energyFit,
      })

      return {
        score,
        activity: a,
      }
    })
    activitiesByScore.sort((a, b) => b.score - a.score)

    c.log({ activitiesByScore, effortBudget })

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

  swapActivityOnDay(day = new Date(), activityId: string) {
    c.log(activityId)
    const results = this.getResultsForDay(
      c.dateToDateString(day),
    )
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
    day = new Date(),
    specificActivity?: Activity,
  ): boolean {
    c.log('addActivityOnDay')
    const results = this.getResultsForDay(
      c.dateToDateString(day),
    )
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

  get yesterday(): DatedResults[0] | null {
    const yesterday = c.dateToDateString(
      c.addDaysToDate(new Date(), -1),
    )
    return (
      this.clears.find((c) => c.date === yesterday) || null
    )
  }

  getDay(day: DateString | Date): DatedResults[0] | null {
    if (day instanceof Date) day = c.dateToDateString(day)
    return this.clears.find((c) => c.date === day) || null
  }
  get today(): DatedResults[0] | null {
    const currentDate = c.dateToDateString()
    return (
      this.clears.find((c) => c.date === currentDate) ||
      null
    )
  }

  bringClearsUpToDate(): void {
    if (!this.activities.length) return
    let prevClears = this.clears
    this.clears = c.getUpdatedClears(this.clears)

    if (
      JSON.stringify(prevClears) !==
      JSON.stringify(this.clears)
    )
      this.save(['clears'])
  }

  getResultsForDay(
    day: DateString,
  ): DatedResults[0] | null {
    const existing = this.clears.find((c) => c.date === day)
    if (existing) return existing
    const newClears: DatedResults[0] = {
      date: day,
      clears: {},
    }
    // insert in proper order
    const clears = [...this.clears]
    clears.push(newClears)
    clears.sort((a, b) => a.date.localeCompare(b.date))
    this.clears = clears
    this.save(['clears'])
    return newClears
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
    day: DateString | Date = c.dateToDateString(),
  ): boolean {
    if (day instanceof Date) day = c.dateToDateString(day)
    const found = this.clears.find(
      (clear) => clear.date === day,
    )
    if (!found) return false
    // c.log(
    //   found,
    //   (found.effortExpended || 0) >=
    //     (found.acceptableEffort || -1),
    // )
    return (
      !!found.maxEffort &&
      (found.effortExpended || 0) >=
        (found.acceptableEffort || -1)
    )
  }

  clearActivity(
    activity: Activity,
    day = c.dateToDateString(),
    setTo: Clear = 1,
  ) {
    const userWasCleared = this.didClearOnDay(day)

    const results = this.getResultsForDay(day)
    if (!results) return
    const activitiesForDay = this.getActivitiesForDay(
      new Date(day),
    )
    results.clears[activity.id] = setTo
    results.effortExpended = c.r2(
      activitiesForDay
        .filter((a) => a.didClearOnDay(new Date(day)))
        .reduce((a, b) => a + b.effortRequired, 0),
    )
    c.log(
      results.effortExpended,
      activity.effortRequired,
      setTo,
    )

    this.save(['clears'])

    if (!userWasCleared && this.didClearOnDay(day)) {
      c.log('full clear!')
      // * full clear!
    }

    if (
      results.effortExpended >= (results.maxEffort || 10000)
    ) {
      c.log('max clear!')
      // * max clear!
    }
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
    Math.max(
      Math.min(
        dueActivitiesEffort +
          optionalEffort *
            // turns down the optional requirement if there are many due activities
            optionalRatio *
            (energy * 0.5),
        totalEffort * 0.95,
      ),
      totalEffort * (0.3 + energy * 0.5),
    ),
  )
  c.log({
    totalEffort,
    dueActivitiesEffort,
    optionalEffort,
    optionalRatio,
    acceptableEffort,
  })
  return acceptableEffort

  // ((energy || 0.5) * 0.7) / 2 + 0.5)
}
