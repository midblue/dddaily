interface EntityConstructorData {
  id: string
  type: EntityType
  updated?: DateTimeString
  created?: DateTimeString
  aiPromptCount?: number
}

interface ClearableWithXPConstructorData
  extends EntityConstructorData {
  clears: ClearString
  clearFrequencyInDays?: number
  xp: number
}

interface UserConstructorData
  extends ClearableWithXPConstructorData {
  hashedPassword: string
  activityConstructors?: ActivityConstructorData[]
  identityConstructors?: IdentityConstructorData[]
  utcOffset?: number
  bonusActivities?: string[]
  muted?: boolean
}

interface IdentityConstructorData
  extends ClearableWithXPConstructorData {
  name: string
}
