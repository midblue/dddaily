type ActivityType =
  | 'FlashCard'
  | 'CheckIn'
  | 'Timed'
  | 'Journal'
  | 'RatingOverTime'

interface ActivityConstructorData
  extends ClearableWithXPConstructorData {
  name: string
  activityType: ActivityType
  availableStartHour?: number
  availableEndHour?: number
  relatedIdentityIds?: string[]
  postponeUntilHour?: number | null
}

interface FlashCardActivityConstructorData
  extends ActivityConstructorData {
  activityType: 'FlashCard'
  averageCardTimeInSeconds?: number
  language?: string
  cards?: FlashCardConstructorData[]
}

interface TimedActivityConstructorData
  extends ActivityConstructorData {
  activityType: 'Timed'
  allottedMinutes?: number
  frequency?: 'daily' | 'weekly'
}

// * prompted activities

interface PromptedActivityConstructorData
  extends ActivityConstructorData {
  prompt: string
}

interface CheckInActivityConstructorData
  extends PromptedActivityConstructorData {
  activityType: 'CheckIn'
  checkInFrequencyInDays?: number
}

interface RatingOverTimeActivityConstructorData
  extends PromptedActivityConstructorData {
  activityType: 'RatingOverTime'
  ratings?: [DateTimeString, number][]
}

interface JournalActivityConstructorData
  extends PromptedActivityConstructorData {
  activityType: 'Journal'
  entries?: [DateTimeString, string][]
}
