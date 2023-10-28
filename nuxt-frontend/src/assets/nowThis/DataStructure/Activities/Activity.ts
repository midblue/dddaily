import * as c from '~/../../common'
import { ClearableWithXP } from '../BaseClasses/ClearableWithXP'
import type { User } from '../User'

export class Activity extends ClearableWithXP {
  name: string
  type: EntityType = 'Activity'
  activityType: ActivityType
  prompt: string | null
  maxTimeInMinutes: number = Infinity
  timeSpentTodayInMs: number = 0

  relatedIdentityIds: string[] = []

  private _hsl: [number, number, number] = [0, 0, 0]
  private _skipToday: boolean = false
  private _postponeUntil: DateTimeString | null = null
  private _lastDone: DateString = c.dateToDateString(
    new Date(0),
  )
  private _availableStartHour: number = 0

  constructor(
    data: ActivityConstructorData,
    parent: User | null = null,
  ) {
    super(data, parent)
    this.name = data.name || 'Activity'
    this.activityType = data.activityType || 'General'
    this._availableStartHour = data.availableStartHour || 0
    this._postponeUntil = data.postponeUntil || null
    this.maxTimeInMinutes =
      data.maxTimeInMinutes || Infinity
    this.timeSpentTodayInMs = data.timeSpentTodayInMs || 0
    this.relatedIdentityIds = data.relatedIdentityIds || []
    this.prompt = data.prompt || null
    this._hsl = data.hsl || c.randomFromArray(c.colors)
    //  [
    //   c.randomIntBetweenInclusive(0, 360),
    //   c.randomIntBetweenInclusive(30, 100),
    //   c.randomIntBetweenInclusive(30, 70),
    // ]
    this._skipToday = data.skipToday || false

    this.passiveReset()
  }

  getSaveableData(): ActivityConstructorData {
    return {
      ...super.getSaveableData(),
      name: this.name,
      activityType: this.activityType,
      availableStartHour: this._availableStartHour,
      postponeUntil: this._postponeUntil,
      maxTimeInMinutes: this.maxTimeInMinutes,
      timeSpentTodayInMs: this.timeSpentTodayInMs,
      relatedIdentityIds: this.relatedIdentityIds,
      hsl: this.hsl,
      skipToday: this._skipToday,
      prompt: this.prompt || null,
    }
  }

  get functionalActivityType(): 'CheckIn' | 'Timed' {
    if (
      this.maxTimeInMinutes &&
      this.maxTimeInMinutes !== Infinity
    )
      return 'Timed'
    return 'CheckIn'
  }

  set hsl(hsl: [number, number, number]) {
    this._hsl = hsl
    this.save(['hsl'])
  }
  get hsl(): [number, number, number] {
    return this._hsl
  }

  hslString(a?: number): string {
    if (a) {
      return `hsla(${this.hsl[0]}, ${this.hsl[1]}%, ${this.hsl[2]}%, ${a})`
    }
    return `hsl(${this.hsl[0]}, ${this.hsl[1]}%, ${this.hsl[2]}%)`
  }

  get postponeUntil(): DateTimeString | null {
    return this._postponeUntil
  }
  set postponeUntil(time: DateTimeString | null) {
    if (time === this._postponeUntil) return
    this._postponeUntil = time
    this.save(['postponeUntil'])
  }

  get lastDone(): DateString {
    return (
      this.clearsAsDatedBooleanArray.findLast(
        (cl) => cl.clear,
      )?.date || c.dateToDateString(new Date(0))
    )
  }

  get availableStartHour(): number {
    return this._availableStartHour
  }
  set availableStartHour(hour: number) {
    if (hour === this._availableStartHour) return
    this._availableStartHour = hour
    this.save(['availableStartHour'])
  }

  dailyReset(): void {
    this.postponeUntil = null
    this._skipToday = false
    this.timeSpentTodayInMs = 0
    super.dailyReset()
    this.save([
      'timeSpentTodayInMs',
      'postponeUntil',
      'skipToday',
    ])
  }

  get estimatedTimeInMinutes(): number {
    return this.maxTimeInMinutes === Infinity
      ? 1
      : this.maxTimeInMinutes
  }
  get estimatedTimeLeftTodayInMinutes(): number {
    return this.couldStillBeDoneToday
      ? this.estimatedTimeInMinutes *
          (1 - this.progressToday)
      : 0
  }
  get baseXPForClear(): number {
    return Math.ceil(
      Math.min(1, this.estimatedTimeInMinutes / 10),
    )
  }

  get dueAt(): DateTimeString {
    if (this.isDue) return c.dateToDateTimeString()
    if (this.postponeUntil) return this.postponeUntil
    const lastDoneDate = new Date(this.lastDone)
    lastDoneDate.setHours(this.availableStartHour || 0)
    lastDoneDate.setMinutes(0)
    lastDoneDate.setSeconds(0)
    let nextDueDate = lastDoneDate
    while (nextDueDate < new Date()) {
      nextDueDate = c.addDaysToDate(nextDueDate, 1)
    }
    return c.dateToDateTimeString(nextDueDate)
  }

  get isDue(): boolean {
    if (
      this.availableStartHour &&
      new Date().getHours() < this.availableStartHour
    )
      return false
    if (this.progressToday === 1) return false
    if (this.skipToday) return false
    if (this.didClearOnDate()) return false
    if (this.postponeUntil !== null)
      return c.dateToDateTimeString() >= this.postponeUntil
    return true
  }

  get couldStillBeDoneToday(): boolean {
    return (
      !this.didClearOnDate() &&
      this.estimatedTimeInMinutes > 0
    )
  }
  get progressToday(): number {
    if (this.maxTimeInMinutes !== Infinity) {
      return c.clamp(
        0,
        this.timeSpentTodayInMs /
          (this.maxTimeInMinutes * 60 * 1000),
        1,
      )
    }
    return this.couldStillBeDoneToday ? 0 : 1
  }

  get skipToday(): boolean {
    return this._skipToday
  }
  set skipToday(doSkip: boolean) {
    if (doSkip === this._skipToday) return
    if (this.progressToday === 1 && doSkip) return
    this._skipToday = doSkip
    this.save(['skipToday'])
  }

  postponeForHours(hours: number): void {
    this.skipToday = false
    const postponeDate = new Date(
      Date.now() + hours * 60 * 60 * 1000,
    )
    postponeDate.setMinutes(0)
    postponeDate.setSeconds(0)
    this.postponeUntil =
      c.dateToDateTimeString(postponeDate)
  }

  setClearOnDate(
    clear: boolean,
    date: Date | DateString = new Date(),
  ): void {
    if (clear) {
      this.postponeUntil = null
    }
    this.skipToday = false
    super.setClearOnDate(clear, date)
  }
}
