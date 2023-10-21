import * as c from '../../common'

import {
  Storage,
  StorageValue,
  createStorage,
} from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import path from 'path'

const storage: Storage<StorageValue> = createStorage({
  driver: fsDriver({
    base: path.join(__dirname, '../../../', 'data'),
  }),
})

// before process termination
process.on('SIGINT', () => {
  storage.dispose()
})

export async function getWithoutChildren<
  T extends EntityConstructorData,
>(keyOrHasPath: string | GettablePath): Promise<T | null> {
  let key = keyOrHasPath as string
  if (typeof keyOrHasPath !== 'string') {
    key = c.gettablePathToDbPath(keyOrHasPath)
  }

  const baseData =
    ((await storage.getItem(key)) as T) || null
  return baseData
}

const structure = {
  User: {
    Activity: {
      FlashCard: {},
    },
    Identity: {},
  },
}
function subPropTypeNameToConstructorParamName(
  typeName: string,
) {
  return `${typeName
    .slice(0, 1)
    .toLowerCase()}${typeName.slice(1)}Constructors`
}

export async function get<T extends EntityConstructorData>(
  keyOrHasPath: string | GettablePath,
): Promise<T | null> {
  let key = keyOrHasPath as string
  if (typeof keyOrHasPath !== 'string') {
    key = c.gettablePathToDbPath(keyOrHasPath)
  }

  const baseData =
    ((await storage.getItem(key)) as T) || null
  if (!baseData) {
    return null
  }

  let fullData: T = { ...baseData }

  // * determine child types
  const structurePath = key
    .split('/')
    .map((k) => k.split('-')[0])
    // remove users/
    .slice(1)
  let hasSubPropTypes: object = { ...structure }
  for (let key of structurePath)
    hasSubPropTypes = hasSubPropTypes[key]

  await getSubPropConstructorsRecursively(
    `${key.replace(/\//g, ':')}-data:`,
    hasSubPropTypes,
    fullData,
  )

  async function getSubPropConstructorsRecursively(
    currentPath: string,
    hasSubPropTypes: object,
    addSubPropTo: object,
  ) {
    if (!Object.keys(hasSubPropTypes).length) {
      return
    }

    const childKeys = await storage.getKeys(currentPath)
    // c.log('getSubPropConstructorsRecursively', {
    //   currentPath,
    //   hasSubPropTypes,
    //   willCheckSubPropTypes: Object.keys(hasSubPropTypes),
    //   childKeys,
    // })
    for (let subPropType of Object.keys(hasSubPropTypes)) {
      // c.log('looking for subPropType', subPropType)
      // * get subProp constructors
      const subPropConstructorKeys = childKeys.filter(
        (child) =>
          new RegExp(`${subPropType}[^/:]+$`).test(child),
      )
      // c.log(
      //   'subPropConstructorKeys',
      //   subPropConstructorKeys,
      // )

      const subPropConstructorPromises: Promise<EntityConstructorData | null>[] =
        []
      for (let child of subPropConstructorKeys) {
        subPropConstructorPromises.push(
          storage.getItem<EntityConstructorData | null>(
            child,
          ),
        )
      }
      const subPropConstructors = (
        await Promise.all(subPropConstructorPromises)
      ).filter((x): x is EntityConstructorData => !!x)

      if (!subPropConstructors.length) {
        // c.log('no subPropConstructors', subPropType)
        continue
      }

      addSubPropTo[
        subPropTypeNameToConstructorParamName(subPropType)
      ] = subPropConstructors
      // c.log(
      //   'got data for',
      //   subPropConstructors.length,
      //   subPropTypeNameToConstructorParamName(subPropType),
      // )

      // * get subProp children
      for (let subPropConstructor of subPropConstructors) {
        const subPropConstructorPath = `${currentPath}${subPropType}-${subPropConstructor.id}-data:`
        await getSubPropConstructorsRecursively(
          subPropConstructorPath,
          hasSubPropTypes[subPropType],
          subPropConstructor,
        )
      }
    }
  }

  return fullData
}

export async function set(
  data: SaveableData,
): Promise<void> {
  await storage.setItem(
    c.gettablePathToDbPath(
      c.saveableDataToGettablePath(data),
    ),
    data.elementToSave,
  )
}

export async function remove(
  path: GettablePath,
): Promise<boolean> {
  const dbPath = c.gettablePathToDbPath(path)
  const exists = await storage.hasItem(dbPath)
  if (!exists) {
    c.log(
      'red',
      'failed to delete:',
      dbPath,
      'does not exist',
    )
    return false
  }

  const childKeys = await storage.getKeys(
    `${dbPath.replace(/\//g, ':')}-data:`,
  )
  for (let childKey of childKeys) {
    await storage.removeItem(childKey)
  }

  await storage.removeItem(dbPath)
  return true
}
