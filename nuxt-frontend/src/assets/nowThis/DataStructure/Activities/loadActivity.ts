import * as c from '~/../../common'
import { FlashCardActivity } from './FlashCardActivity'
import { CheckInActivity } from './Prompted/CheckInActivity'
import { TimedActivity } from './TimedActivity'
import { JournalActivity } from './Prompted/JournalActivity'
import { RatingOverTimeActivity } from './Prompted/RatingOverTimeActivity'
import type { Activity } from './Activity'

export function loadActivity(
  data:
    | FlashCardActivityConstructorData
    | TimedActivityConstructorData
    | CheckInActivityConstructorData
    | JournalActivityConstructorData
    | RatingOverTimeActivityConstructorData,
  parent: any = null,
): Activity | null {
  switch (data.activityType) {
    case 'FlashCard':
      return new FlashCardActivity(data, parent)
    case 'Timed':
      return new TimedActivity(data, parent)
    case 'CheckIn':
      return new CheckInActivity(data, parent)
    case 'Journal':
      return new JournalActivity(data, parent)
    case 'RatingOverTime':
      return new RatingOverTimeActivity(data, parent)

    default:
      console.error(`Unknown activity name`, data)
      return null
  }
}
