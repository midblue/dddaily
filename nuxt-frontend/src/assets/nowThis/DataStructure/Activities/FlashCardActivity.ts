import * as c from '~/../../common'
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
    for (let cardData of data.flashCardConstructors || []) {
      this.addCardFromConstructorData(cardData)
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
    }
  }

  addCardFromConstructorData(
    data: FlashCardConstructorData,
    save = false,
  ) {
    const card = new FlashCard(data, this)
    this.cards.push(card)
    card.parent = this
    if (save) card.save()
    return card
  }

  removeCard(card: FlashCard): boolean {
    const found = this.cards.find((c) => c === card)
    if (!found) return false
    this.cards = this.cards.filter((c) => c !== card)
    card.remove()

    return true
  }

  get cardsDueToday(): FlashCard[] {
    return this.cards
  }

  get estimatedTimeInMinutes(): number {
    return (
      (this.averageCardTimeInSeconds *
        this.cardsDueToday.length) /
      60
    )
  }
}
