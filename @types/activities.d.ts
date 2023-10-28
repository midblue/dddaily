type ActivityType = 'General'
//'FlashCard' |
// | 'Journal'
// | 'RatingOverTime'

interface ActivityConstructorData
  extends ClearableWithXPConstructorData {
  name: string
  activityType: ActivityType
  lastDone?: DateString | null
  availableStartHour?: number
  // availableEndHour?: number
  relatedIdentityIds?: string[]
  maxTimeInMinutes?: number
  timeSpentTodayInMs?: number
  prompt?: string | null
  skipToday?: boolean
  postponeUntil?: DateTimeString | null
  hsl?: [number, number, number]
}

interface FlashCardActivityConstructorData
  extends ActivityConstructorData {
  activityType: 'FlashCard'
  averageCardTimeInSeconds?: number
  language?: string
  flashCardConstructors?: FlashCardConstructorData[]
}

// * prompted activities

interface CheckInActivityConstructorData
  extends ActivityConstructorData {
  activityType: 'CheckIn'
  // /** same 0101 boolean string as ClearStrings */
  // checkInSuccesses?: string
  // checkInFrequencyInDays?: number
}

interface TimedActivityConstructorData
  extends ActivityConstructorData {
  activityType: 'Timed'
}

// interface RatingOverTimeActivityConstructorData
//   extends ActivityConstructorData {
//   activityType: 'RatingOverTime'
//   ratings?: [DateTimeString, number][]
// }

// interface JournalActivityConstructorData
//   extends ActivityConstructorData {
//   activityType: 'Journal'
//   entries?: [DateTimeString, string][]
// }
