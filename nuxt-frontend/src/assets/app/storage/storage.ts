import * as c from '~/../../common'
// import * as local from './local'
import * as remote from './remote'

type SaveResult = ('local' | 'remote')[]
export async function saveElement(
  saveableData: SaveableData,
): Promise<SaveResult> {
  const resultsPromises = [
    // await local.saveElement(saveableData),
    await remote.saveElement(saveableData),
  ]

  const results = await Promise.all(resultsPromises)
  const remoteSuccess = results[0]

  const saveResults: SaveResult = []
  // if (localSuccess) saveResults.push('local')
  if (remoteSuccess) saveResults.push('remote')
  return saveResults
}

export async function removeElement(
  path: GettablePath,
): Promise<SaveResult> {
  const resultsPromises = [
    // await local.removeElement(path),
    await remote.removeElement(path),
  ]

  const results = await Promise.all(resultsPromises)
  const remoteSuccess = results[0]

  const saveResults: SaveResult = []
  // if (localSuccess) saveResults.push('local')
  if (remoteSuccess) saveResults.push('remote')
  return saveResults
}

export async function loadFullUserData(
  id: string,
): Promise<UserConstructorData | null> {
  const remoteRes = await remote.loadFullUserDataFromRemote(
    id,
  )
  // if (!remoteRes) await local.loadFullUserDataFromLocal(id)
  return remoteRes
}
