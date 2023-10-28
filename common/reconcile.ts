/**
 *  returns first object if both objects have the same updated date
 */
export function mergeByRecency(
  a: SaveableData['elementToSave'],
  b: SaveableData['elementToSave'],
): SaveableData['elementToSave'] {
  let moreRecent: SaveableData['elementToSave']
  if (a.updated === b.updated) {
    console.log(
      'resolving conflict by localVersion',
      a.localVersion,
      b.localVersion,
    )
    if ((a.localVersion || 0) > (b.localVersion || 0))
      moreRecent = a
    else moreRecent = b
  } else if ((a.updated || '0') > (b.updated || '0'))
    moreRecent = a
  else moreRecent = b

  const lessRecent = moreRecent === a ? b : a
  const merged = { ...lessRecent, ...moreRecent }
  return merged
}

export function saveableDataToGettablePath(
  saveableData: SaveableData,
): GettablePath {
  const path = [...saveableData.parentPath]
  path.push({
    type: saveableData.elementToSave.type,
    id: saveableData.elementToSave.id,
  })
  return path
}

export function gettablePathToDbPath(
  gettablePath: GettablePath,
) {
  let path = 'users/'
  const allButLastEl = gettablePath.slice(
    0,
    gettablePath.length - 1,
  )
  for (let el of allButLastEl) {
    path += `${el.type}-${el.id}-data/`
  }
  const lastEl = gettablePath[gettablePath.length - 1]
  path += `${lastEl.type}-${lastEl.id}`

  return path
}
