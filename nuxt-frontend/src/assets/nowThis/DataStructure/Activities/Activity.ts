import * as c from '~/../../common'
import { ClearableWithXP } from '../BaseClasses/ClearableWithXP'

export abstract class Activity extends ClearableWithXP {
  name: string
  type: EntityType = 'Activity'
  activityType: ActivityType
  availableStartHour: number = 0
  availableEndHour: number = 24
  postponeUntilHour: number | null
  relatedIdentityIds: string[] = []
  hsl: [number, number, number] = [0, 0, 0]

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
    this.hsl = data.hsl || [
      c.randomIntBetweenInclusive(0, 360),
      c.randomIntBetweenInclusive(30, 100),
      c.randomIntBetweenInclusive(30, 70),
    ]

    this.passiveReset()
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
      hsl: this.hsl,
    }
  }

  hslString(a?: number): string {
    if (a) {
      return `hsla(${this.hsl[0]}, ${this.hsl[1]}%, ${this.hsl[2]}%, ${a})`
    }
    return `hsl(${this.hsl[0]}, ${this.hsl[1]}%, ${this.hsl[2]}%)`
  }

  dailyReset(): void {
    this.postponeUntilHour = null
    super.dailyReset()
  }

  get estimatedTimeInMinutes(): number {
    return 15
  }
  get estimatedTimeLeftTodayInMinutes(): number {
    return this.isDoneForNow
      ? 0
      : this.estimatedTimeInMinutes *
          (1 - this.progressToday)
  }

  get progressToday(): number {
    return this.isDoneForNow ? 1 : 0
  }
}
