import * as local from './local'
import * as remote from './remote'

type SaveResult = ('local' | 'remote')[]
export async function saveElement(
  saveableData: SaveableData,
): Promise<SaveResult> {
  const resultsPromises = [
    await local.saveElement(saveableData),
    await remote.saveElement(saveableData),
  ]

  const results = await Promise.all(resultsPromises)
  const localSuccess = results[0]
  const remoteSuccess = results[1]

  const saveResults: SaveResult = []
  if (localSuccess) saveResults.push('local')
  if (remoteSuccess) saveResults.push('remote')
  return saveResults
}
