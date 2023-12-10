import * as c from '~/../../common'
// import {
//   getRemoteActionQueue,
//   queueForRemoteAction,
//   setRemoteActionQueue,
// } from './local'
import * as state from '~/assets/app/appState'

let connected = true

function addConnectionListeners() {
  fetch(state.getRemoteUrl())
    .then(() => {
      c.l('Connected to remote server.')
      connected = true
    })
    .catch(() => {
      c.l('Could not connect to remote server.')
      connected = false
    })

  if (typeof window !== 'undefined') {
    window?.addEventListener('offline', () => {
      connected = false
    })

    window?.addEventListener('online', async () => {
      await fetch(state.getRemoteUrl())
        .then(() => {
          connected = true
          // saveQueuedElementsToRemote()
        })
        .catch(() => {
          c.l('Could not connect to remote server')
          connected = false
        })
    })
  }
}
setTimeout(addConnectionListeners, 100)

async function sendElementForRemoteSave(
  data: SaveableData,
): Promise<boolean> {
  const remoteRes = await fetch(
    `${state.getRemoteUrl()}/addOrUpdate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: state.getPassword(),
      },
      body: JSON.stringify({ ...data }),
    },
  )
    .then((res) => {
      // console.log(res)
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

export async function loadElementFromRemote<
  T extends EntityConstructorData,
>(path: GettablePath): Promise<T | null> {
  const remoteRes = await fetch(
    `${state.getRemoteUrl()}/get`,
    {
      method: 'POST',
      body: JSON.stringify({
        path,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: state.getPassword(),
      },
    },
  )
    .then(async (res) => {
      const json = await res.json()
      if (!json.id) return null
      return json as T
    })
    .catch((error) => {
      c.error(
        error.response?.data || error.message || error,
      )
      return null
    })
  return remoteRes
}

export async function loadFullUserDataFromRemote(
  id: string,
): Promise<UserConstructorData | null> {
  return await loadElementFromRemote<UserConstructorData>([
    { type: 'User', id },
  ])
}

export async function removeElement(path: GettablePath) {
  const remoteRes = await fetch(
    `${state.getRemoteUrl()}/remove`,
    {
      method: 'POST',
      body: JSON.stringify({
        path,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: state.getPassword(),
      },
    },
  )
    .then(async (res) => {
      return (await res.json()).ok
    })
    .catch((error) => {
      c.error(
        error.response?.data || error.message || error,
      )
      return false
    })
  return remoteRes
}

export async function saveElement(
  data: SaveableData,
): Promise<boolean> {
  if (!connected) {
    // queueForRemoteAction({ type: 'addOrUpdate', data })
    c.log('Queued element for remote save on reconnect')
    return false
  }

  return await sendElementForRemoteSave(data)
}

// async function saveQueuedElementsToRemote() {
//   const queuedElements = getRemoteActionQueue()
//   let failedElements: RemoteActionData[] = []

//   let queuedElement = queuedElements.shift()
//   while (queuedElement) {
//     if (queuedElement.type === 'addOrUpdate') {
//       const succeeded = await sendElementForRemoteSave(
//         queuedElement.data,
//       )
//       if (!succeeded) {
//         failedElements.push(queuedElement)
//         continue
//       }
//     }

//     // todo add delete

//     queuedElement = queuedElements.shift()
//   }

//   setRemoteActionQueue(failedElements)
// }
