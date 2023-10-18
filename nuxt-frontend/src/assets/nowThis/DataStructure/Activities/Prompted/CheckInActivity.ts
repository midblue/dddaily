import * as c from '../../../../../../../common'
import { PromptedActivity } from './PromptedActivity'

export class CheckInActivity extends PromptedActivity {
  checkInFrequencyInDays: number

  constructor(
    data: CheckInActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.checkInFrequencyInDays =
      data.checkInFrequencyInDays || 1
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): CheckInActivityConstructorData {
    return {
      ...super.getSaveableData(),
      activityType: 'CheckIn',
      checkInFrequencyInDays: this.checkInFrequencyInDays,
    }
  }
}
