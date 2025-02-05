import * as c from '../../common'
import * as db from '../db/db'
import * as bcrypt from 'bcrypt'
import getAuthedUser from '../getAuthedUser'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  c.log('gray', '    /get POST request', body)

  if (
    !body ||
    !body.elementToSave ||
    !body.parentPath ||
    !Array.isArray(body.parentPath)
  ) {
    c.log('red', '  Invalid body', body)
    setResponseStatus(event, 400)
    return {
      status: 400,
      body: { message: 'Missing Params' },
    }
  }
  const saveableData: SaveableData = body
  const type = saveableData.elementToSave.type

  if (!type) {
    c.log('red', '  Invalid type', saveableData)
    setResponseStatus(event, 400)
    return {
      status: 400,
      body: { message: 'Missing Params' },
    }
  }

  const existingData = await db.getWithoutChildren(
    c.saveableDataToGettablePath(saveableData),
  )

  // * skip auth check on user creation
  if (
    type !== 'User' ||
    (type === 'User' && existingData)
  ) {
    const user = await getAuthedUser(event)
    if (!user) {
      c.log('gray', '    Auth failed')
      setResponseStatus(event, 401)
      return { status: 401, body: { message: 'Invalid' } }
    }

    const userInPath =
      body.parentPath[0]?.id ||
      (body.elementToSave.type === 'User'
        ? (body.elementToSave as any).id
        : 'x')
    if (userInPath !== user.id) {
      c.log('gray', '  User not authorized to update data')
      setResponseStatus(event, 401)
      return { status: 401, body: { message: 'Invalid' } }
    }
  }

  // c.log({ existingData })

  const add = !existingData
  if (existingData && !existingData.id) {
    c.log('red', 'Invalid existingData', existingData)
    setResponseStatus(event, 400)
    return { status: 400, body: { message: 'Invalid' } }
  }
  if (
    existingData?.updated ===
    saveableData.elementToSave.updated
  ) {
    c.log(
      'red',
      'Received timestamp match',
      saveableData.elementToSave,
    )
  }

  // * check if server-side data is newer than incoming data
  // * bias towards incoming data if newer
  let dataToSave: SaveableData['elementToSave'] = {
    ...saveableData.elementToSave,
  }
  if (!add) {
    dataToSave = c.mergeByRecency(
      saveableData.elementToSave,
      existingData as EntityDbData,
    )
  }

  const headers = event.headers
  // * add hashed password on user creation
  if (add && type === 'User') {
    if (!headers.get('authorization')) {
      c.log('red', '  Missing password')
      setResponseStatus(event, 401)
      return { status: 401, body: { message: 'Invalid' } }
    }
    ;(dataToSave as any).hashedPassword = bcrypt.hashSync(
      headers.get('authorization') as string,
      10,
    )
  }

  try {
    c.log(
      'gray',
      '  ',
      add ? 'Adding' : 'Updating',
      saveableData.elementToSave.type,
      saveableData.elementToSave.id,
      // saveableData.elementToSave,
      // { existingData, dataToSave },
    )
    db.set({
      elementToSave: dataToSave,
      parentPath: saveableData.parentPath,
    })
    setResponseStatus(event, 200)
    return { status: 200, body: { ok: true } }
  } catch (e) {
    c.log('red', '  Error saving', e)
    setResponseStatus(event, 500)
    return {
      status: 500,
      body: { message: 'Error saving' },
    }
  }
})
