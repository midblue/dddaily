import * as c from '../../../../../../common'
import { Activity } from './Activity'

export class TimedActivity extends Activity {
  allottedMinutes: number
  postponeUntilHour: number | null
  frequency: 'daily' | 'weekly'

  constructor(
    data: TimedActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.allottedMinutes = data.allottedMinutes || 10
    this.postponeUntilHour = data.postponeUntilHour || null
    this.frequency = data.frequency || 'daily'
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): TimedActivityConstructorData {
    return {
      ...super.getSaveableData(),
      activityType: 'Timed',
      allottedMinutes: this.allottedMinutes,
      postponeUntilHour: this.postponeUntilHour,
      frequency: this.frequency,
    }
  }
}
