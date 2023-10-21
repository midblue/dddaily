import * as c from '~/../../common'

export function createFlashCardData(data: {
  front: string
  back: string
}): FlashCardConstructorData {
  return {
    ...data,
    id: c.id('FlashCard'),
    type: 'FlashCard',
  }
}
