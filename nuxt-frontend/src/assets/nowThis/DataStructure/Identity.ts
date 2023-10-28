import * as c from '~/../../common'
import { ClearableWithXP } from './BaseClasses/ClearableWithXP'
import type { User } from './User'
import type { Activity } from './Activities/Activity'

export class Identity extends ClearableWithXP {
  type: EntityType = 'Identity'
  name: string
  relatedActivityIds: string[] = []

  constructor(
    data: IdentityConstructorData,
    parent: User | null = null,
  ) {
    super(data, parent)
    this.name = data.name || 'Identity'
    this.relatedActivityIds = data.relatedActivityIds || []
  }

  get relatedActivities(): Activity[] {
    return this.relatedActivityIds
      .map((id) =>
        this.parent?.activities.find((a) => a.id === id),
      )
      .filter((a): a is Activity => !!a)
  }

  addXp(xp: number): void {
    this.xp += xp
    if (!this.boostToHighestActivityXp()) this.save(['xp'])
  }

  boostToHighestActivityXp(): boolean {
    const highest = this.relatedActivities.reduce(
      (highest, a) => Math.max(highest, a.xp),
      0,
    )
    if (highest > this.xp) {
      this.xp = highest
      this.save(['xp'])
      return true
    }
    return false
  }

  passiveReset(): void {
    this.boostToHighestActivityXp()

    const previousRelatedActivityIds = [
      ...this.relatedActivityIds,
    ]
    const newRelatedActivityIds =
      this.relatedActivityIds.filter((id) =>
        this.parent?.activities.find((a) => a.id === id),
      )
    if (
      previousRelatedActivityIds.length !==
      newRelatedActivityIds.length
    ) {
      this.relatedActivityIds = newRelatedActivityIds
      this.save(['relatedActivityIds'])
    }

    super.passiveReset()
  }
  dailyReset() {
    this.updateClears()
    super.dailyReset()
  }

  updateClears(): void {
    const initialClearString = this.clears
    if (!this.relatedActivities.length) {
      this.clears = (c.dateToDateString() +
        '_') as ClearString
      return
    }

    const firstDay =
      this.relatedActivities.reduce(
        (first, a) =>
          first.clearStartDay < a.clearStartDay ? first : a,
        this.relatedActivities[0],
      )?.clearStartDay || this.clearStartDay
    let newClearString: ClearString = (firstDay +
      '_') as ClearString
    let dayPointer = new Date(this.clearStartDay)
    const daysUntilTodayInclusive =
      c.daysBetween(dayPointer, new Date()) + 1
    for (let i = 0; i < daysUntilTodayInclusive; i++) {
      const allCleared = this.relatedActivities.every(
        (a) =>
          a.didClearOnDate(dayPointer) ||
          !a.didExistOnDate(dayPointer),
      )
      newClearString += allCleared ? '1' : '0'
      dayPointer = c.addDaysToDate(dayPointer, 1)
    }
    if (newClearString !== initialClearString) {
      c.log(
        'gray',
        'updateClears',
        newClearString,
        initialClearString,
      )
      this.clears = newClearString
      this.save(['clears'])
    }
  }

  getSaveableData(): IdentityConstructorData {
    return {
      ...super.getSaveableData(),
      name: this.name,
      relatedActivityIds: this.relatedActivityIds,
    }
  }
}
