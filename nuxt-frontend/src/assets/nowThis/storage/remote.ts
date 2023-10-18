import * as c from '../../../../../common'
import axios from 'axios'
import {
  getRemoteSaveQueue,
  queueForRemoteSave,
  setRemoteSaveQueue,
} from './local'

const remoteUrl = 'http://127.0.0.1:3003/'

let connected = true
axios
  .get(remoteUrl)
  .then(() => {
    connected = true
  })
  .catch(() => {
    c.l('Could not connect to remote server')
    connected = false
  })

if (typeof window !== 'undefined') {
  connected = window.navigator.onLine

  window?.addEventListener('offline', () => {
    connected = false
  })

  window?.addEventListener('online', async () => {
    await axios
      .get(remoteUrl)
      .then(() => {
        connected = true
        saveQueuedElementsToRemote()
      })
      .catch(() => {
        c.l('Could not connect to remote server')
        connected = false
      })
  })
}

async function sendElementForRemoteSave(
  data: SaveableData,
): Promise<boolean> {
  const remoteRes = await axios
    .post(`${remoteUrl}/save/element`, { ...data })
    .then((res) => {
      console.log(res)
      return true
    })
    .catch((error) => {
      c.error(
        error.response?.data || error.message || error,
      )
      return false
    })
  return remoteRes
}

export async function loadElementFromRemote(
  id: string,
  parentPath: { type: EntityType; id: string }[],
): Promise<EntityConstructorData | null> {
  // todo single element
  return null
}

export async function loadFullUserDataFromRemote(
  id: string,
): Promise<UserConstructorData> {
  // todo not dummy data
  return {
    type: 'User',
    id,
    hashedPassword: 'test',
    activityConstructors: [
      {
        type: 'Activity',
        activityType: 'FlashCard',
        id: c.id('Activity'),
        name: `New Activity`,
        clears: c.newClearString(),
        xp: 0,
        cards: [
          {
            front: 'front',
            back: 'back',
            id: c.id('FlashCard'),
            type: 'FlashCard',
          },
        ],
      } as FlashCardActivityConstructorData,
    ],
    identityConstructors: [],
    utcOffset: 0,
    bonusActivities: [],
    muted: false,
    clears: c.newClearString(),
    clearFrequencyInDays: 1,
    xp: 0,
  }
}

export async function saveElement(
  data: SaveableData,
): Promise<boolean> {
  if (!connected) {
    queueForRemoteSave(data)
    c.log('Queued element for remote save on reconnect')
    return false
  }

  return await sendElementForRemoteSave(data)
}

async function saveQueuedElementsToRemote() {
  const queuedElements = getRemoteSaveQueue()
  let failedElements: SaveableData[] = []

  let queuedElement = queuedElements.shift()
  while (queuedElement) {
    const succeeded = await sendElementForRemoteSave(
      queuedElement,
    )
    if (!succeeded) {
      failedElements.push(queuedElement)
      continue
    }

    queuedElement = queuedElements.shift()
  }

  setRemoteSaveQueue(failedElements)
}
