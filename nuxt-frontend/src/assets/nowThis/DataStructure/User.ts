import * as c from '~/../../common'
import { ClearableWithXP } from './BaseClasses/ClearableWithXP'
import { Activity } from './Activities/Activity'
import { Identity } from './Identity'

type XPGained = {
  element: Activity | Identity
  previousXp: number
  newXp: number
  totalXpGained: number
  didLevelUp: boolean
  /** i.e. activity */
  didClear?: boolean
  previousLevel: number
  newLevel: number
  multipliers: { for: string; multiplier: number }[]
}[]

export class User extends ClearableWithXP {
  type: EntityType = 'User'
  activities: Activity[]
  activityIdOrder: string[]
  identities: Identity[]
  utcOffset: number
  bonusActivities: string[]
  muted: boolean = false

  private currentDay: DateString = c.dateToDateString()
  private dailyHooks: (() => void)[] = []

  constructor(data: UserConstructorData) {
    super(data)
    this.utcOffset = data.utcOffset || 0
    this.bonusActivities = data.bonusActivities || []
    this.muted = data.muted || false

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

    this.identities = []
    for (let i of data.identityConstructors || []) {
      this.addIdentityFromConstructorData(i)
    }

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
    this.identities.forEach((identity) =>
      identity.passiveReset(),
    )
    super.passiveReset()
  }

  dailyReset() {
    this.activities.forEach((activity) =>
      activity.dailyReset(),
    )
    this.identities.forEach((identity) =>
      identity.dailyReset(),
    )
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
      utcOffset: this.utcOffset,
      activityIdOrder: this.activityIdOrder,
      bonusActivities: this.bonusActivities,
      muted: this.muted,
    }
  }

  bringClearsUpToDate(): void {
    if (!this.activities.length) return
    let prevClears = this.clears

    const firstActivityClear = this.activities.reduce(
      (earliest, activity) => {
        const activityClear = activity.clears.split(
          '_',
        )[0] as DateString
        if (earliest && earliest < activityClear)
          return earliest
        return activityClear
      },
      c.dateToDateString(),
    )
    this.clears = (firstActivityClear + '_') as ClearString
    this.clears = c.getUpdatedClearString(this.clears) // gets proper number of entries

    const clearsDated = this.clearsAsDatedBooleanArray.map(
      (clear) => ({
        clear: this.activities
          .filter((a) => a.existedOnDate(clear.date))
          .every((a) => a.didClearOnDate(clear.date)),
        date: new Date(clear.date),
      }),
    )
    this.clears =
      c.datedClearBooleanArrayToClearString(clearsDated)
    if (prevClears !== this.clears) this.save(['clears'])
  }

  addIdentityFromConstructorData(
    data: IdentityConstructorData,
    save = false,
  ) {
    const identity = new Identity(data, this)
    this.identities.push(identity)
    identity.parent = this
    if (save) {
      identity.save()
    }

    return identity
  }

  removeIdentity(identity: Identity): boolean {
    const found = this.identities.find(
      (i) => i === identity,
    )
    if (!found) return false
    this.identities = this.identities.filter(
      (i) => i !== identity,
    )
    identity.remove()

    return true
  }

  getIdentityById(id: string): Identity | null {
    return this.identities.find((i) => i.id === id) || null
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

  getActivityById(id: string): Activity | null {
    return this.activities.find((a) => a.id === id) || null
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

  get todaysActivities(): Activity[] {
    const todaysActivities: Activity[] = []
    for (let activity of this.orderedActivities) {
      if (activity.isDue) todaysActivities.push(activity)
      else if (activity.didClearOnDate())
        todaysActivities.push(activity)
    }
    return todaysActivities
  }
  get dueActivities(): Activity[] {
    return this.todaysActivities.filter((a) => a.isDue)
  }

  get nextDueActivity(): Activity | null {
    return this.dueActivities[0] || null
  }

  get estimatedTimeLeftTodayInMinutes(): number {
    return this.dueActivities.reduce(
      (total, a) =>
        total + a.estimatedTimeLeftTodayInMinutes,
      0,
    )
  }

  get nextUpcomingActivity(): Activity {
    if (this.nextDueActivity) return this.nextDueActivity
    const nextUpcoming = this.activities.reduce(
      (soonest, a) =>
        soonest.dueAt > a.dueAt ? a : soonest,
      this.activities[0],
    )
    return nextUpcoming
  }

  get nextActivityAt(): Date {
    return new Date(this.nextUpcomingActivity?.dueAt || 0)
  }

  clearActivityAndGainXp(activity: Activity): XPGained {
    const res: XPGained = []

    // * activity itself

    let previousActivityXp = activity.xp
    let previousActivityLevel = activity.level
    activity.setClearOnDate(true, new Date())
    let activityMultipliers: XPGained[0]['multipliers'] = []
    if (activity.xpGainMultiplier > 1)
      activityMultipliers.push({
        for: `${activity.name} ${activity.currentStreak}x streak`,
        multiplier: activity.xpGainMultiplier,
      })
    if (this.xpGainMultiplier > 1)
      activityMultipliers.push({
        for: `${this.currentStreak} day full streak`,
        multiplier: this.xpGainMultiplier,
      })
    const combinedMultiplier =
      activityMultipliers.reduce(
        (total, m) => total * m.multiplier,
        1,
      ) || 1
    let gainedActivityXp =
      activity.baseXPForClear * combinedMultiplier
    activity.addXp(gainedActivityXp)

    res.push({
      element: activity,
      previousXp: previousActivityXp,
      newXp: activity.xp,
      previousLevel: previousActivityLevel,
      newLevel: activity.level,
      didLevelUp: previousActivityLevel < activity.level,
      totalXpGained: gainedActivityXp,
      multipliers: activityMultipliers,
    })

    // * all related identities

    const relatedIdentities = this.identities.filter((i) =>
      i.relatedActivityIds.includes(activity.id),
    )
    for (let identity of relatedIdentities) {
      let previousIdentityXp = identity.xp
      let previousIdentityLevel = identity.level
      let didClear = false
      if (
        identity.relatedActivities.every((a) =>
          a.didClearOnDate(),
        )
      ) {
        identity.setClearOnDate(true, new Date())
        didClear = true
      }
      let identityMultipliers: XPGained[0]['multipliers'] =
        [...activityMultipliers]
      if (identity.xpGainMultiplier > 1)
        identityMultipliers.push({
          for: `${identity.name} ${identity.currentStreak}x streak`,
          multiplier: identity.xpGainMultiplier,
        })
      const combinedMultiplier =
        identityMultipliers.reduce(
          (total, m) => total * m.multiplier,
          1,
        ) || 1
      let gainedIdentityXp =
        identity.baseXPForClear * combinedMultiplier
      identity.addXp(gainedIdentityXp)

      res.push({
        element: identity,
        previousXp: previousIdentityXp,
        newXp: identity.xp,
        newLevel: identity.level,
        previousLevel: previousIdentityLevel,
        didLevelUp: previousIdentityLevel < identity.level,
        didClear,
        totalXpGained: gainedIdentityXp,
        multipliers: identityMultipliers,
      })
    }

    return res
  }
}
