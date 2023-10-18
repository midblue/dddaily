import * as c from '../../../../../../common'
import { ClearableWithXP } from '../BaseClasses/ClearableWithXP'

export abstract class Activity extends ClearableWithXP {
  name: string
  type: EntityType = 'Activity'
  activityType: ActivityType
  availableStartHour: number = 0
  availableEndHour: number = 24
  postponeUntilHour: number | null
  relatedIdentityIds: string[] = []

  constructor(
    data: ActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.name = data.name
    this.activityType = data.activityType
    this.availableStartHour = data.availableStartHour || 0
    this.availableEndHour = data.availableEndHour || 24
    this.postponeUntilHour = data.postponeUntilHour || null
    this.relatedIdentityIds = data.relatedIdentityIds || []
  }

  getSaveableData(): ActivityConstructorData {
    return {
      ...super.getSaveableData(),
      name: this.name,
      activityType: this.activityType,
      availableStartHour: this.availableStartHour,
      availableEndHour: this.availableEndHour,
      postponeUntilHour: this.postponeUntilHour,
      relatedIdentityIds: this.relatedIdentityIds,
    }
  }

  dailyReset(): void {
    this.postponeUntilHour = null
    super.dailyReset()
  }
}
