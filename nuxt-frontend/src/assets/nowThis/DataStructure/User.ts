import * as c from '../../../../../common'
import { ClearableWithXP } from './BaseClasses/ClearableWithXP'
import { Activity } from './Activities/Activity'
import { loadActivity } from './Activities/loadActivity'
import { Identity } from './Identity'

export class User extends ClearableWithXP {
  type: EntityType = 'User'
  hashedPassword: string
  activities: Activity[]
  identities: Identity[]
  utcOffset: number
  bonusActivities: string[]
  muted: boolean = false

  constructor(data: UserConstructorData) {
    super(data)
    this.hashedPassword = data.hashedPassword
    this.utcOffset = data.utcOffset || 0
    this.bonusActivities = data.bonusActivities || []
    this.muted = data.muted || false

    this.activities = []
    for (let a of data.activityConstructors || []) {
      this.addActivityFromConstructorData(a)
    }

    this.identities = []
    for (let i of data.identityConstructors || []) {
      this.addIdentityFromConstructorData(i)
    }
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
      hashedPassword: this.hashedPassword,
      activityConstructors: this.activities.map(
        (activity) => activity.getSaveableData(),
      ),
      identityConstructors: this.identities.map(
        (identity) => identity.getSaveableData(),
      ),
      utcOffset: this.utcOffset,
      bonusActivities: this.bonusActivities,
      muted: this.muted,
    }
  }

  addIdentityFromConstructorData(
    data: IdentityConstructorData,
  ) {
    const identity = new Identity(data, this)
    this.identities.push(identity)
    identity.parent = this
  }

  addActivityFromConstructorData(
    data: ActivityConstructorData,
  ) {
    const activity = loadActivity(data as any, this)
    if (!activity) {
      c.error(`Failed to load activity`, data)
      return
    }
    this.activities.push(activity)
    activity.parent = this
  }
}
