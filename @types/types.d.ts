/** YYYY-MM-DD */
type DateString = `${number}-${number}-${number}`
/** TT:TT */
type TimeString = `${number}:${number}:${number}.${number}`
/** YYYY-MM-DDThh:mm */
type DateTimeString = `${DateString}T${TimeString}`

/** 0: did not clear, 1: did clear */
type Clear = 0 | 1
type DatedResults = {
  date: DateString
  /** 0-1 */
  mood?: number
  /** 0-1 */
  energy?: number
  maxEffort?: number
  acceptableEffort?: number
  effortExpended?: number
  clears: {
    [activityId: string]: Clear
  }
  backupActivityIds?: string[]
  // usedFreebie?: boolean
  // awardedFreebie?: boolean
}[]

type EntityType = 'User' | 'Activity' | 'Identity'

interface EntityConstructorData {
  id: string
  type: EntityType
  updated?: DateTimeString
  created?: DateTimeString
}
interface EntityDbData extends EntityConstructorData {
  localVersion: number
  updated: DateTimeString
}

interface UserConstructorData
  extends EntityConstructorData {
  clears: DatedResults
  activityConstructors?: ActivityConstructorData[]
  activityIdOrder?: string[]
  // freebiesAvailable?: number
}
interface UserDbData extends UserConstructorData {
  hashedPassword: string
}

interface ActivityConstructorData
  extends EntityConstructorData {
  name: string
  timer?: number | null
  effortRequired?: number
  moodLowLimit?: number
  moodHighLimit?: number
  dayInterval?: number
  exact?: boolean
  inspiration?: string
}

type GettablePath = { type: EntityType; id: string }[]
interface SaveableData {
  elementToSave: Partial<EntityConstructorData> & {
    type: EntityType
    id: string
    updated: DateTimeString
    localVersion: number
  }
  parentPath: GettablePath
}
