import * as c from '~/../../common'

export const localStorageAvailable =
  typeof localStorage !== 'undefined'

export function setPassword(password: string) {
  localStorage.setItem('password', password)
}
export function getPassword() {
  return localStorage.getItem('password') || ''
}
export function getUserId() {
  return localStorage.getItem('userId') || ''
}
export function setUserId(userId: string) {
  localStorage.setItem('userId', userId)
}

// function save(saveableData: SaveableData) {
//   const pathString = c.gettablePathToDbPath(
//     c.saveableDataToGettablePath(saveableData),
//   )
//   localStorage.setItem(
//     pathString,
//     JSON.stringify(saveableData.elementToSave),
//   )
// }

// export function saveElement(
//   saveableData: SaveableData,
// ): boolean {
//   if (!localStorageAvailable) return false

//   c.log('Saving element locally', saveableData)
//   save(saveableData)
//   return true
// }

// export function loadElementFromLocal<
//   T extends EntityConstructorData,
// >(path: GettablePath): T | null {
//   if (!localStorageAvailable) return null

//   const pathString = c.gettablePathToDbPath(path)
//   const localRes = localStorage.getItem(pathString)
//   if (!localRes) return null
//   const parsed = JSON.parse(localRes)
//   return parsed as T
// }

// export function removeElement(path: GettablePath): boolean {
//   if (!localStorageAvailable) return false

//   c.log('Removing element locally', path)
//   localStorage.removeItem(path[path.length - 1].id)
//   return true
// }

// // * ----- local remote save queue -----

// function addToRemoteActionQueue(data: RemoteActionData) {
//   const existingQueue = localStorage.getItem(
//     'remoteActionQueue',
//   )
//   const newQueue = existingQueue
//     ? JSON.parse(existingQueue)
//     : []
//   newQueue.push(data)
//   localStorage.setItem(
//     'remoteActionQueue',
//     JSON.stringify(newQueue),
//   )
// }

// export function setRemoteActionQueue(
//   setTo: RemoteActionData[],
// ) {
//   localStorage.setItem(
//     'remoteActionQueue',
//     JSON.stringify(setTo),
//   )
// }
// export function queueForRemoteAction(
//   data: RemoteActionData,
// ): boolean {
//   if (!localStorageAvailable) return false

//   c.log('Queueing element for remote save', data)
//   addToRemoteActionQueue(data)

//   return false
// }

// export function getRemoteActionQueue(): RemoteActionData[] {
//   const existingQueue = localStorage.getItem(
//     'remoteActionQueue',
//   )
//   return existingQueue ? JSON.parse(existingQueue) : []
// }
