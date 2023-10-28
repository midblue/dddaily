import * as c from '../../common'
import { Router } from 'express'
import * as db from '../db/db'
import * as bcrypt from 'bcrypt'

const routes = Router()

routes.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.elementToSave ||
    !req.body.parentPath ||
    !Array.isArray(req.body.parentPath)
  ) {
    res.status(400).json({ message: 'Missing Params' })
    return
  }
  const saveableData: SaveableData = req.body
  const type = saveableData.elementToSave.type

  if (!type) {
    c.log('red', 'Invalid type', saveableData)
    res.status(400).json({ message: 'Missing Params' })
    return
  }

  const existingData = await db.getWithoutChildren(
    c.saveableDataToGettablePath(saveableData),
  )
  c.log({ existingData })

  const add = !existingData
  if (existingData && !existingData.id) {
    c.log('red', 'Invalid existingData', existingData)
    res.status(400).json({ message: 'Invalid' })
    return
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

  // * add hashed password on user creation
  if (add && type === 'User') {
    if (!req.headers.authorization) {
      res.status(401).json({ message: 'Invalid' })
      return
    }
    ;(dataToSave as any).hashedPassword = bcrypt.hashSync(
      req.headers.authorization as string,
      10,
    )
  }

  try {
    c.log(
      'gray',
      add ? 'Adding' : 'Updating',
      saveableData.elementToSave,
      { existingData, dataToSave },
    )
    db.set({
      elementToSave: dataToSave,
      parentPath: saveableData.parentPath,
    })
    res.json({ ok: true })
  } catch (e) {
    res
      .status(500)
      .json({ ok: false, message: 'Error saving' })
    return
  }
})

export default routes
