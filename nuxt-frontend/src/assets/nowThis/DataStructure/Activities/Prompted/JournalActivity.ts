import * as c from '~/../../common'
import { PromptedActivity } from './PromptedActivity'

export class JournalActivity extends PromptedActivity {
  entries: [DateTimeString, string][]

  constructor(
    data: JournalActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.entries = data.entries || []
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): JournalActivityConstructorData {
    return {
      ...super.getSaveableData(),
      activityType: 'Journal',
      entries: this.entries,
    }
  }

  get estimatedTimeInMinutes(): number {
    return 5
  }
}
