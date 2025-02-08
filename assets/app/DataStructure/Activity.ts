import * as c from '~/common'
import type { User } from './User'
import { Entity } from './Entity'

import moment from 'moment'
import type { Moment } from 'moment'

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

    return (
      (this.parent as User).getDaysWhere({
        filter: (c) => (c.clears[this.id] || 0) > 0,
        limit: 1,
        order: 'desc',
      })?.[0]?.date || null
    )
  }
  get lastDoneBeforeToday(): DateString | null {
    if (!this.parent) return null
    const todayString = c.dateString()
    return (
      (this.parent as User).getDaysWhere({
        filter: (c) =>
          (c.clears[this.id] || 0) > 0 &&
          c.date !== todayString,
        limit: 1,
        order: 'desc',
      })?.[0]?.date || null
    )
  }

  didClearOnDay(day?: Moment | DateString): boolean {
    const clearData = (this.parent as User).getDay(
      day || moment(),
    )
    if (!clearData) return false

    return clearData.clears[this.id] > 0
  }

  override getSaveableData(): ActivityConstructorData {
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

  override dailyReset(): void {
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
    const lastDone = this.lastDone || moment(0)
    const today = c.dateString()
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
  get daysUntilStreakBreak(): number {
    const lastDone = this.lastDoneBeforeToday
    if (!lastDone) return 0
    const today = c.dateString()
    const daysSinceLastDone = c.daysBetween(lastDone, today)
    return (
      this.streakLeewayEitherDirection -
      (daysSinceLastDone - this.dayInterval)
    )
  }
  get willBreakStreakIfNotDoneToday(): boolean {
    return this.daysUntilStreakBreak <= 0
  }
  get missedInARow(): number {
    const history = this.history
    let missedInARow = 0
    for (let i = 0; i < history.length; i++) {
      if (
        history[i] === Activity.ActivityHistory.NotAssigned
      )
        continue
      else if (
        history[i] ===
        Activity.ActivityHistory.FailedAndBrokeStreak
      )
        missedInARow++
      else break
    }
    return missedInARow
  }

  static ActivityHistory = {
    NotAssigned: -1,
    FailedAndBrokeStreak: 0,
    FailedButWithinLeeway: 1,
    Completed: 5,
  } as const
  /**
   * array going back in time from today in new-to-old order where
   * -1 is "was not assigned",
   * 0 is "failed to complete and streak ended",
   * 1 is "failed to complete but was within leeway limit",
   * and 5 is "completed"
   * */
  get history(): (typeof Activity.ActivityHistory)[keyof typeof Activity.ActivityHistory][] {
    if (!this.parent) return []
    const allClears = (this.parent as User).clears
    if (!allClears) return []

    let history: (typeof Activity.ActivityHistory)[keyof typeof Activity.ActivityHistory][] =
      []
    let lastDoneDate = moment(0)
    const streakLeewayEitherDirection =
      this.streakLeewayEitherDirection
    for (let i = 0; i < allClears.length; i++) {
      const clearData = allClears[i].clears[this.id]
      if (clearData === undefined)
        history.push(Activity.ActivityHistory.NotAssigned)
      else {
        if (clearData > 0) {
          history.push(Activity.ActivityHistory.Completed)
          lastDoneDate = moment(allClears[i].date)
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
            history.push(
              Activity.ActivityHistory
                .FailedButWithinLeeway,
            )
          } else {
            // c.log(
            //   daysBetween,
            //   this.dayInterval,
            //   streakLeewayEitherDirection,
            // )
            history.push(
              Activity.ActivityHistory.FailedAndBrokeStreak,
            )
          }
        }
      }
    }
    history.reverse()
    // c.log(this.name, history.slice(0, 10))

    // remove trailing -1s
    while (
      history[history.length - 1] ===
      Activity.ActivityHistory.NotAssigned
    )
      history.pop()

    // skip "failed to complete" if it's today and could still be done
    if (
      (
        [
          Activity.ActivityHistory.FailedAndBrokeStreak,
          Activity.ActivityHistory.FailedButWithinLeeway,
        ] as any
      ).includes(history[0])
    ) {
      // c.log(
      //   'skipping failed to complete for today',
      //   this.name,
      // )
      history = history.slice(1)
    }

    // c.log(this.name, history)
    return history
  }

  get streak(): number {
    const history = this.history
    let streak = 0
    for (let i = 0; i < history.length; i++) {
      if (history[i] === Activity.ActivityHistory.Completed)
        streak++
      else if (
        history[i] ===
        Activity.ActivityHistory.FailedAndBrokeStreak
      )
        break
    }
    return streak
  }

  get totalTimesDone(): number {
    if (!this.parent) return 0
    return (
      (this.parent as User).getDaysWhere({
        filter: (c) => c.clears[this.id] > 0,
        limit: undefined,
        order: 'asc',
      })?.length || 0
    )
  }
}
