interface EntityConstructorData {
  id: string
  type: EntityType
  updated?: DateTimeString
  created?: DateTimeString
  promptCount?: number
}
interface EntityDbData extends EntityConstructorData {
  localVersion: number
  updated: DateTimeString
}

interface ClearableWithXPConstructorData
  extends EntityConstructorData {
  clears: ClearString
  clearFrequencyInDays?: number
  xp: number
  xpHistory?: XPHistoryEntry[]
}

interface UserConstructorData
  extends ClearableWithXPConstructorData {
  activityConstructors?: ActivityConstructorData[]
  activityIdOrder?: string[]
  identityConstructors?: IdentityConstructorData[]
  utcOffset?: number
  bonusActivities?: string[]
  muted?: boolean
}
interface UserDbData extends UserConstructorData {
  hashedPassword: string
}

interface IdentityConstructorData
  extends ClearableWithXPConstructorData {
  name: string
  relatedActivityIds?: string[]
}
