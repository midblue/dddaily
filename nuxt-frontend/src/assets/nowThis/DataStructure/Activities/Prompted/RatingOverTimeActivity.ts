import * as c from '../../../../../../../common'
import { PromptedActivity } from './PromptedActivity'

export class RatingOverTimeActivity extends PromptedActivity {
  ratings: [DateTimeString, number][]

  constructor(
    data: RatingOverTimeActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.ratings = data.ratings || []
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): RatingOverTimeActivityConstructorData {
    return {
      ...super.getSaveableData(),
      activityType: 'RatingOverTime',
      ratings: this.ratings,
    }
  }
}
