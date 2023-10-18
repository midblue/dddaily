import * as c from '../../../../../../common'
import { Activity } from './Activity'
import { FlashCard } from './FlashCard/FlashCard'

export class FlashCardActivity extends Activity {
  averageCardTimeInSeconds: number
  language?: string
  cards: FlashCard[]

  constructor(
    data: FlashCardActivityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.averageCardTimeInSeconds =
      data.averageCardTimeInSeconds || 10
    this.language = data.language
    this.cards = []
    for (let card of data.cards || []) {
      this.addCardFromConstructorData(card)
    }
  }

  dailyReset() {
    this.cards.forEach((card) => card.dailyReset())
    super.dailyReset()
  }

  getSaveableData(): FlashCardActivityConstructorData {
    return {
      ...super.getSaveableData(),
      activityType: 'FlashCard',
      averageCardTimeInSeconds:
        this.averageCardTimeInSeconds,
      language: this.language,
      cards: this.cards.map((card) =>
        card.getSaveableData(),
      ),
    }
  }

  addCardFromConstructorData(
    data: FlashCardConstructorData,
  ) {
    const card = new FlashCard(data, this)
    this.cards.push(card)
    card.parent = this
  }
}
