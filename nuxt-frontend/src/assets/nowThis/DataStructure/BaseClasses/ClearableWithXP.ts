import * as c from '../../../../../../common'
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

  get clearsAsBooleanArray(): boolean[] {
    return (
      this.clears
        .split('_')?.[1]
        ?.split('')
        .map((x) => x === '1') || []
    )
  }

  /** positive for clear streak, negative for fail streak */
  get currentStreak(): number {
    if (this.clearsAsBooleanArray.length === 0) return 0
    let clearStreak: boolean =
      this.clearsAsBooleanArray[
        this.clearsAsBooleanArray.length - 1
      ]
    let streak = 0
    for (
      let i = this.clearsAsBooleanArray.length - 1;
      i >= 0;
      i--
    ) {
      if (clearStreak && this.clearsAsBooleanArray[i])
        streak++
      else if (
        !clearStreak &&
        !this.clearsAsBooleanArray[i]
      )
        streak--
      else break
    }
    return streak
  }

  dailyReset(): void {
    super.dailyReset()
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
