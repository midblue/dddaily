import * as c from '../../../../../common'

export const localStorageAvailable =
  typeof localStorage !== 'undefined'

function save(elementToSave: EntityConstructorData) {
  localStorage.setItem(
    elementToSave.id,
    JSON.stringify(elementToSave),
  )
}

export function saveElement({
  elementToSave,
  parentPath,
}: SaveableData): boolean {
  if (!localStorageAvailable) return false

  c.log('Saving element locally', elementToSave, parentPath)
  save(elementToSave)
  return true
}

function reconcileRemoteSingleEntityWithLocal(
  local: EntityConstructorData,
  remote: EntityConstructorData,
) {
  const merged = c.pickMoreRecentEntity(local, remote)
  const didUseRemote = merged === remote
  if (didUseRemote) save(merged)

  return merged
}

// * ----- local remote save queue -----

function addToRemoteSaveQueue(data: SaveableData) {
  const existingQueue = localStorage.getItem(
    'remoteSaveQueue',
  )
  const newQueue = existingQueue
    ? JSON.parse(existingQueue)
    : []
  newQueue.push(data)
  localStorage.setItem(
    'remoteSaveQueue',
    JSON.stringify(newQueue),
  )
}

export function setRemoteSaveQueue(setTo: SaveableData[]) {
  localStorage.setItem(
    'remoteSaveQueue',
    JSON.stringify(setTo),
  )
}
export function queueForRemoteSave(
  data: SaveableData,
): boolean {
  if (!localStorageAvailable) return false

  c.log('Queueing element for remote save', data)
  addToRemoteSaveQueue(data)

  return false
}

export function getRemoteSaveQueue(): SaveableData[] {
  const existingQueue = localStorage.getItem(
    'remoteSaveQueue',
  )
  return existingQueue ? JSON.parse(existingQueue) : []
}
