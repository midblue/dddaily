import * as c from '~/../../common'
import type { User } from './User'
import { Entity } from './Entity'

export class Activity extends Entity {
  name: string
  type: EntityType = 'Activity'
  timer: number | null = null
  effortRequired: number = 0
  moodLowLimit: number = 0
  moodHighLimit: number = 1
  dayInterval: number = 1
  exact: boolean = false

  constructor(
    data: ActivityConstructorData,
    parent: User | null = null,
  ) {
    super(data, parent)
    this.name = data.name || 'Activity'
    this.timer = parseInt(`${data.timer}`) ?? null
    this.effortRequired = parseFloat(
      `${data.effortRequired ?? 0}`,
    )
    this.moodLowLimit = parseFloat(
      `${data.moodLowLimit ?? 0}`,
    )
    this.moodHighLimit = parseFloat(
      `${data.moodHighLimit ?? 1}`,
    )
    this.dayInterval = parseInt(`${data.dayInterval ?? 1}`)
    this.exact = !!data.exact

    this.passiveReset()
  }

  get lastDone(): DateString | null {
    if (!this.parent) return null

    const clears = (this.parent as User).clears
    if (!clears) return null

    for (let i = clears.length - 1; i >= 0; i--) {
      const clearData = clears[i]
      if ((clearData.clears[this.id] || 0) > 0)
        return clearData.date
    }

    return null
  }
  get lastDoneBeforeToday(): DateString | null {
    if (!this.parent) return null

    const clears = (this.parent as User).clears
    if (!clears) return null

    for (let i = clears.length - 1; i >= 0; i--) {
      const clearData = clears[i]
      if (
        (clearData.clears[this.id] || 0) > 0 &&
        clearData.date !== c.dateToDateString()
      )
        return clearData.date
    }

    return null
  }

  didClearOnDay(day = new Date()): boolean {
    if (!this.parent) return false
    const clears = (this.parent as User).clears
    if (!clears) return false

    const dateString = c.dateToDateString(day)
    const clearData = clears.find(
      (c) => c.date === dateString,
    )
    if (!clearData) return false

    return clearData.clears[this.id] > 0
  }

  getSaveableData(): ActivityConstructorData {
    return {
      ...super.getSaveableData(),
      name: this.name,
      timer: this.timer,
      effortRequired: this.effortRequired,
      moodLowLimit: this.moodLowLimit,
      moodHighLimit: this.moodHighLimit,
      dayInterval: this.dayInterval,
      exact: this.exact,
    }
  }

  dailyReset(): void {
    super.dailyReset()
  }

  /**
   * number 0-2
   * 0: not due,
   * 1: due
   * 2: overdue
   * 999: exact and is due now
   */
  get dueness(): number {
    const lastDone = this.lastDone || new Date(0)
    const today = c.dateToDateString()
    const daysSinceLastDone = c.daysBetween(lastDone, today)
    if (this.exact && daysSinceLastDone < this.dayInterval)
      return -999
    const percentDue = daysSinceLastDone / this.dayInterval
    if (this.exact && percentDue >= 1) return 999
    return c.clamp(0, percentDue, 2)
  }

  get streakLeewayEitherDirection(): number {
    return this.exact ? 0 : Math.round(this.dayInterval / 2)
  }
  get willBreakStreakIfNotDoneToday(): boolean {
    const lastDone = this.lastDoneBeforeToday
    if (!lastDone) return false
    if (this.streak < 0) return true

    const today = c.dateToDateString()
    const daysSinceLastDone = Math.abs(
      c.daysBetween(lastDone, today),
    )
    // c.log(
    //   this.name,
    //   lastDone,
    //   daysSinceLastDone,
    //   daysSinceLastDone - this.dayInterval,
    //   this.streakLeewayEitherDirection,
    // )
    return (
      daysSinceLastDone - this.dayInterval >
      this.streakLeewayEitherDirection - 1
    )
  }

  get streak(): number {
    if (!this.parent) return 0
    const clears = (this.parent as User).clears
    if (!clears) return 0

    let streak = 0
    const leeway = this.streakLeewayEitherDirection

    let lastDone = c.dateToDateString()
    for (let i = clears.length - 1; i >= 0; i--) {
      const clearData = clears[i]
      // skip if not required for that day
      if (clearData.clears[this.id] === undefined) continue
      // if done, increase streak
      if ((clearData.clears[this.id] || 0) > 0) {
        lastDone = clearData.date
        streak++
      }
      // don't worry about today
      else if (i === clears.length - 1) continue
      else if (
        clearData.clears[this.id] !== undefined &&
        clearData.clears[this.id] < 1 &&
        streak <= 0
      )
        streak--
      // allow for leeway (only positive streak)
      else if (
        streak >= 0 &&
        leeway &&
        c.daysBetween(lastDone, clearData.date) <= leeway
      ) {
        // c.log(this.name, lastDone, clearData.date, leeway)
        continue
      } else break
    }

    return streak
  }

  get totalTimesDone(): number {
    if (!this.parent) return 0
    const clears = (this.parent as User).clears
    if (!clears) return 0

    let total = 0
    for (let i = clears.length - 1; i >= 0; i--) {
      const clearData = clears[i]
      total += clearData.clears[this.id] || 0
    }

    return total
  }
}
