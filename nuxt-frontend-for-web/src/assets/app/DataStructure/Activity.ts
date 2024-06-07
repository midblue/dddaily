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
  inspiration: string = ''

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

    this.inspiration = data.inspiration || ''

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
      inspiration: this.inspiration,
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
      this.streakLeewayEitherDirection
    )
  }

  /**
   * array going back in time from today in new-to-old order
   * where -1 is "was not assigned",
   * 0 is "failed to complete and streak ended",
   * 1 is "failed to complete but was within leeway limit",
   * and 5 is "completed"
   * */
  get history(): (-1 | 0 | 1 | 5)[] {
    if (!this.parent) return []
    const allClears = (this.parent as User).clears
    if (!allClears) return []

    let history: (-1 | 0 | 1 | 5)[] = []
    let lastDoneDate = new Date(0)
    const streakLeewayEitherDirection =
      this.streakLeewayEitherDirection
    for (let i = 0; i < allClears.length; i++) {
      const clearData = allClears[i].clears[this.id]
      if (clearData === undefined) history.push(-1)
      else {
        if (clearData > 0) {
          history.push(5)
          lastDoneDate = new Date(allClears[i].date)
        } else if (clearData === 0) {
          const daysBetween = c.daysBetween(
            allClears[i].date,
            lastDoneDate,
          )
          if (
            streakLeewayEitherDirection &&
            daysBetween - this.dayInterval <=
              streakLeewayEitherDirection
          ) {
            history.push(1)
            lastDoneDate = new Date(allClears[i].date)
          } else {
            // c.log(
            //   daysBetween,
            //   this.dayInterval,
            //   streakLeewayEitherDirection,
            // )
            history.push(0)
          }
        }
      }
    }
    history.reverse()

    // remove trailing -1s
    while (history[history.length - 1] === -1) history.pop()

    // skip "failed to complete" if it's today and could still be done
    if ([0, 1].includes(history[0])) {
      history = history.slice(1)
    }

    // c.log(this.name, history)
    return history
  }

  get streak(): number {
    const history = this.history
    let streak = 0
    for (let i = 0; i < history.length; i++) {
      if (history[i] === 5) streak++
      else if (history[i] === 0) break
    }
    return streak

    // if (!this.parent) return 0
    // const clears = (this.parent as User).clears
    // if (!clears) return 0

    // let streak = 0
    // const leeway = this.streakLeewayEitherDirection

    // let lastDone = c.dateToDateString()
    // for (let i = clears.length - 1; i >= 0; i--) {
    //   const clearData = clears[i]
    //   // skip if not required for that day
    //   if (clearData.clears[this.id] === undefined) continue

    //   const isWithinLeeway =
    //     !!leeway &&
    //     Math.abs(c.daysBetween(lastDone, clearData.date)) -
    //       this.dayInterval <=
    //       leeway

    //   c.log(this.name, i, {
    //     streak,
    //     cleared: clearData.clears[this.id]
    //       ? 'cleared'
    //       : 'not cleared',
    //     leeway,
    //     dayInterval: this.dayInterval,
    //     daysBetween: c.daysBetween(
    //       lastDone,
    //       clearData.date,
    //     ),
    //     isWithinLeeway,
    //   })
    //   // if done, increase streak
    //   if (
    //     (clearData.clears[this.id] || 0) === 1 &&
    //     streak >= 0
    //   ) {
    //     lastDone = clearData.date
    //     streak++
    //   }
    //   // don't worry about today
    //   else if (i === clears.length - 1) continue
    //   // allow for leeway (only positive streak)
    //   else if (streak >= 0 && isWithinLeeway) {
    //     continue
    //   }
    //   // if not done, decrease streak
    //   else if (
    //     clearData.clears[this.id] !== undefined &&
    //     clearData.clears[this.id] < 1 &&
    //     streak <= 0
    //   )
    //     streak--
    //   else break
    // }

    // return streak
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
