import * as c from '~/../../common'
import { Entity } from './Entity'

export abstract class ClearableWithXP extends Entity {
  abstract type: EntityType
  clears: ClearString
  /** defaults to 1 */
  clearFrequencyInDays: number = 1
  xp: number = 0
  xpHistory: XPHistoryEntry[] = []

  constructor(
    data: ClearableWithXPConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.clears = data.clears || c.newClearString()
    this.clearFrequencyInDays =
      data.clearFrequencyInDays || 1
    this.xp = data.xp || 0
    this.xpHistory = data.xpHistory || []
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

  didExistOnDate(
    date: Date | DateString = new Date(),
  ): boolean {
    return (
      this.clearStartDay <=
      (date instanceof Date
        ? c.dateToDateString(date)
        : date)
    )
  }
  didClearOnDate(
    date: Date | DateString = new Date(),
  ): boolean {
    const dateString =
      date instanceof Date ? c.dateToDateString(date) : date
    const clears = this.clearsAsDatedBooleanArray
    const clear = clears.find((c) => c.date === dateString)
    return clear?.clear || false
  }
  existedOnDate(
    date: Date | DateString = new Date(),
  ): boolean {
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
    this.save(['clears'])
    if (this.parent) this.parent.bringClearsUpToDate()
  }

  get isDoneForNow(): boolean {
    return this.didClearOnDate(new Date())
  }

  bringClearsUpToDate(): void {
    let prevClears = this.clears
    this.clears = c.getUpdatedClearString(this.clears)
    if (prevClears !== this.clears) this.save(['clears'])
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

  get baseXPForClear(): number {
    return 1
  }
  addXp(xp: number): void {
    this.xp += xp
    this.save(['xp'])
    this.updateXPHistory()
  }

  updateXPHistory(): void {
    const today = c.dateToDateString()
    const lastEntry =
      this.xpHistory[this.xpHistory.length - 1]
    if (!lastEntry) {
      this.xpHistory.push([today, this.xp])
      this.save(['xpHistory'])
      return
    }
    if (lastEntry[1] === this.xp) return
    if (lastEntry[0] === today) {
      lastEntry[1] = this.xp
    } else {
      this.xpHistory.push([today, this.xp])
    }
    this.save(['xpHistory'])
  }

  get level(): number {
    return c.xpToLevel(this.xp)
  }
  get levelProgress(): number {
    return c.levelProgress(this.xp)
  }
  get totalXpInCurrentLevel(): number {
    return c.totalXPInLevel(this.level)
  }

  get xpGainMultiplier(): number {
    if (this.currentStreak <= 1) return 1
    if (this.currentStreak <= 5) return 2
    if (this.currentStreak < 50) return 3
    if (this.currentStreak < 100) return 4
    if (this.currentStreak < 200) return 5
    if (this.currentStreak < 365) return 6
    return 7
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
      xpHistory: this.xpHistory,
    }
  }
}
