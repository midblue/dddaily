import * as c from '~/../../common'
import { ClearableWithXP } from './BaseClasses/ClearableWithXP'
import { Activity } from './Activities/Activity'
import { loadActivity } from './Activities/loadActivity'
import { Identity } from './Identity'

export class User extends ClearableWithXP {
  type: EntityType = 'User'
  activities: Activity[]
  activityIdOrder: string[]
  identities: Identity[]
  utcOffset: number
  bonusActivities: string[]
  muted: boolean = false

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
    this.updateActivityOrder()

    this.identities = []
    for (let i of data.identityConstructors || []) {
      this.addIdentityFromConstructorData(i)
    }

    this.passiveReset()
  }

  passiveReset() {
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
    let prevClears = this.clears
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
    if (prevClears !== this.clears) this.save()
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

  addActivityFromConstructorData(
    data: ActivityConstructorData,
    save = false,
  ): Activity | null {
    const activity = loadActivity(data as any, this)
    if (!activity) {
      c.error(`Failed to load activity`, data)
      return null
    }
    this.activities.push(activity)
    activity.parent = this
    if (save) {
      activity.save()
      this.activityIdOrder.push(activity.id)
      this.save()
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
      this.save()
    }
  }

  moveActivity(activity: Activity, relativeIndex: number) {
    const foundIndex = this.activityIdOrder.findIndex(
      (a) => a === activity.id,
    )
    if (foundIndex === -1) return false
    let newIndex = c.clamp(
      0,
      foundIndex + relativeIndex,
      this.activityIdOrder.length - 1,
    )
    if (newIndex === foundIndex) return false

    this.activityIdOrder = this.activityIdOrder.filter(
      (a) => a !== activity.id,
    )

    this.activityIdOrder.splice(newIndex, 0, activity.id)
    this.save()

    return true
  }

  get dailyActivities(): Activity[] {
    const dailyActivities: Activity[] = []
    for (let activity of this.activities) {
      dailyActivities.push(activity)
    }
    return dailyActivities
  }

  get nextActivity(): Activity | null {
    for (let activity of this.dailyActivities) {
      if (activity.progressToday < 1) return activity
    }
    return null
  }

  get estimatedTimeLeftTodayInMinutes(): number {
    return this.dailyActivities.reduce(
      (total, a) =>
        total + a.estimatedTimeLeftTodayInMinutes,
      0,
    )
  }
}
