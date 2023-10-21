import * as c from '~/../../common'
import { Entity } from './Entity'

export abstract class ClearableWithXP extends Entity {
  abstract type: EntityType
  clears: ClearString
  /** defaults to 1 */
  clearFrequencyInDays: number = 1
  xp: number = 0

  constructor(
    data: ClearableWithXPConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.clears = data.clears || c.newClearString()
    this.clearFrequencyInDays =
      data.clearFrequencyInDays || 1
    this.xp = data.xp
  }

  get clearStartDay(): DateString {
    return this.clears.split('_')[0] as DateString
  }

  get clearsAsBooleanArray(): boolean[] {
    return (
      this.clears
        .split('_')?.[1]
        ?.split('')
        .map((x) => x === '1') || []
    )
  }

  get clearsAsDatedBooleanArray(): {
    date: DateString
    clear: boolean
  }[] {
    const clears = this.clearsAsBooleanArray
    const startDay = new Date(this.clearStartDay)
    return clears.map((clear, i) => ({
      date: c.dateToDateString(
        c.addDaysToDate(startDay, i),
      ),
      clear,
    }))
  }

  didClearOnDate(date: Date | DateString): boolean {
    const dateString =
      date instanceof Date ? c.dateToDateString(date) : date
    const clears = this.clearsAsDatedBooleanArray
    const clear = clears.find((c) => c.date === dateString)
    return clear?.clear || false
  }
  existedOnDate(date: Date | DateString): boolean {
    return (
      this.clearStartDay <=
      (date instanceof Date
        ? c.dateToDateString(date)
        : date)
    )
  }
  setClearOnDate(
    clear: boolean,
    date: Date | DateString = new Date(),
  ): void {
    const dateString =
      date instanceof Date ? c.dateToDateString(date) : date
    const clears = this.clearsAsDatedBooleanArray
    const clearIndex = clears.findIndex(
      (c) => c.date === dateString,
    )
    if (clearIndex === -1) {
      clears.push({ date: dateString, clear })
    } else {
      clears[clearIndex].clear = clear
    }
    this.clears = `${this.clearStartDay}_${clears
      .map((c) => (c.clear ? '1' : '0'))
      .join('')}`
    this.save()
    if (this.parent) this.parent.bringClearsUpToDate()
  }

  get isDoneForNow(): boolean {
    return this.didClearOnDate(new Date())
  }

  bringClearsUpToDate(): void {
    let prevClears = this.clears
    this.clears = c.getUpdatedClearString(this.clears)
    if (prevClears !== this.clears) {
      this.save()
    }
  }

  /** positive for clear streak, negative for fail streak */
  get currentStreak(): number {
    if (this.clearsAsBooleanArray.length === 0) return 0
    let streak = 0
    for (let clear of [
      ...this.clearsAsBooleanArray,
    ].reverse()) {
      if (
        Math.abs(streak) &&
        Math.sign(streak) !== Math.sign(clear ? 1 : -1)
      ) {
        break
      }
      if (clear) {
        streak++
      } else {
        streak--
      }
    }
    return streak
  }

  get currentStreakNotIncludingToday(): number {
    const cba = this.clearsAsBooleanArray
    if (cba.length < 2) return 0
    let streak = 0
    for (let i = cba.length - 2; i >= 0; i--) {
      if (!cba[i]) {
        break
      }
      streak++
    }
    return streak
  }

  get bestStreak(): number {
    if (this.clearsAsBooleanArray.length === 0) return 0
    let maxStreak = 0
    let currentStreak = 0
    for (let clear of this.clearsAsBooleanArray) {
      if (clear) {
        currentStreak++
        if (currentStreak > maxStreak)
          maxStreak = currentStreak
      } else {
        currentStreak = 0
      }
    }
    return maxStreak
  }

  dailyReset(): void {
    this.bringClearsUpToDate()
    super.dailyReset()
  }
  passiveReset(): void {
    this.bringClearsUpToDate()
    super.passiveReset()
  }

  getSaveableData(): ClearableWithXPConstructorData {
    return {
      ...super.getSaveableData(),
      clears: this.clears,
      clearFrequencyInDays: this.clearFrequencyInDays,
      xp: this.xp,
    }
  }
}
