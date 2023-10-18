import * as c from '../../../../../../../common'
import { Entity } from '../../BaseClasses/Entity'

export class FlashCard extends Entity {
  type: EntityType = 'FlashCard'
  front: string
  back: string
  imageUrl?: string
  example?: [string, string]
  canBeShownAgainAfter: DateTimeString
  responseHistory: [DateTimeString, number][]
  averageTimeInSeconds?: number

  constructor(
    data: FlashCardConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.front = data.front
    this.back = data.back
    this.imageUrl = data.imageUrl
    this.example = data.example
    this.canBeShownAgainAfter =
      data.canBeShownAgainAfter || c.dateToDateTimeString()
    this.responseHistory = data.responseHistory || []
    this.averageTimeInSeconds = data.averageTimeInSeconds
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): FlashCardConstructorData {
    return {
      ...super.getSaveableData(),
      front: this.front,
      back: this.back,
      imageUrl: this.imageUrl,
      example: this.example,
      canBeShownAgainAfter: this.canBeShownAgainAfter,
      responseHistory: this.responseHistory,
      averageTimeInSeconds: this.averageTimeInSeconds,
    }
  }
}
