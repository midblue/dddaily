import * as c from '~/common'
// import {
//   getRemoteActionQueue,
//   queueForRemoteAction,
//   setRemoteActionQueue,
// } from './local'
import * as state from '~/assets/app/appState'

let lastSuccessfulCheck = 0
export async function networkCheck() {
  if (Date.now() - lastSuccessfulCheck < 1000 * 2) {
    return true
  }
  try {
    const res = (await $fetch(
      state.getRemoteUrl() + '/ping',
    )) as { status: number }
    if (res.status === 200) {
      lastSuccessfulCheck = Date.now()
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

export async function checkUserExists(
  id: string,
): Promise<boolean | null> {
  c.log('Checking if user exists:', id)
  const res = (await $fetch(
    `${state.getRemoteUrl()}/userExists?id=${id}`,
  )) as any
  if (res.error) {
    c.error(res.error)
    return null
  }
  if (!res) return null
  return !!res.body?.exists
}

// let connected = true

// function addConnectionListeners() {
//   fetch(state.getRemoteUrl())
//     .then(() => {
//       c.l('Connected to remote server.')
//       connected = true
//     })
//     .catch(() => {
//       c.l('Could not connect to remote server.')
//       connected = false
//     })

//   if (typeof window !== 'undefined') {
//     window?.addEventListener('offline', () => {
//       connected = false
//     })

//     window?.addEventListener('online', async () => {
//       await fetch(state.getRemoteUrl())
//         .then(() => {
//           connected = true
//           // saveQueuedElementsToRemote()
//         })
//         .catch(() => {
//           c.l('Could not connect to remote server')
//           connected = false
//         })
//     })
//   }
// }
// setTimeout(addConnectionListeners, 100)

async function sendElementForRemoteSave(
  data: SaveableData,
): Promise<boolean> {
  const remoteRes = await fetch(
    `${state.getRemoteUrl()}/addOrUpdate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        user:
          state.currentUser.value?.id || state.getUserId(),
        authorization:
          state.currentPassword.value ||
          state.getPassword(),
      },
      body: JSON.stringify({ ...data }),
    },
  )
    .then((res) => {
      console.log(res)
      return res.status === 200
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
  try {
    const remoteRes = (await $fetch(
      `${state.getRemoteUrl()}/get`,
      {
        method: 'POST',
        body: JSON.stringify({
          path,
        }),
        headers: {
          'Content-Type': 'application/json',
          user:
            state.currentUser.value?.id ||
            state.getUserId(),
          authorization:
            state.currentPassword.value ||
            state.getPassword(),
        },
      },
    )) as { status: number; body: T | null }
    if (remoteRes.status !== 200) return null
    if (!remoteRes.body?.id) return null
    return remoteRes.body
  } catch (error: any) {
    c.error(
      'loadElementFromRemote error:',
      error.response?.data || error.message || error,
    )
    return null
  }
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
        user:
          state.currentUser.value?.id || state.getUserId(),
        authorization:
          state.currentPassword.value ||
          state.getPassword(),
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
  // if (!connected) {
  //   // queueForRemoteAction({ type: 'addOrUpdate', data })
  //   c.log('Queued element for remote save on reconnect')
  //   return false
  // }

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
