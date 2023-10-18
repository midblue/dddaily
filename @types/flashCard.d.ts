interface FlashCardConstructorData
  extends EntityConstructorData {
  front: string
  back: string
  imageUrl?: string
  example?: [string, string]
  canBeShownAgainAfter?: DateTimeString
  responseHistory?: [DateTimeString, number][]
  averageTimeInSeconds?: number
}
