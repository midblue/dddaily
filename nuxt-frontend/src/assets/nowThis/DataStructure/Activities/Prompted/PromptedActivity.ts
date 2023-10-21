import * as c from '~/../../common'
import { Activity } from '../Activity'

export class PromptedActivity extends Activity {
  prompt: string

  constructor(
    data: PromptedActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.prompt = data.prompt || 'Did you do this today?'
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): PromptedActivityConstructorData {
    return {
      ...super.getSaveableData(),
      activityType: 'CheckIn',
      prompt: this.prompt,
    }
  }
}
