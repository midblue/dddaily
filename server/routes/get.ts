import * as c from '../../common'
import { Router } from 'express'
import * as db from '../db/db'
import * as bcrypt from 'bcrypt'

const routes = Router()

routes.post('/', async (req, res) => {
  const path = req.body.path as GettablePath
  if (!path || !Array.isArray(path) || path.length < 1) {
    c.log('gray', 'Invalid path')
    res.status(401).json({ message: 'Invalid' })
    return
  }
  let userId = path[0].id
  const rawPassword = req.headers.authorization as string

  if (!userId || !rawPassword) {
    c.log('gray', 'Invalid userId or rawPassword')
    res.status(401).json({ message: 'Invalid' })
    return
  }

  const naiveUserData =
    await db.getWithoutChildren<UserDbData>(
      `users/User-${userId}`,
    )
  if (!naiveUserData) {
    c.log('gray', 'Invalid user')
    res.status(401).json({ message: 'Invalid' })
    return
  }

  if (
    !bcrypt.compareSync(
      rawPassword,
      naiveUserData.hashedPassword ||
        '8929h30jrionu0vw9eijnfb20porqjwdnbwi9efsougbw3',
    )
  ) {
    c.log('gray', 'Invalid password')
    res.status(401).json({ message: 'Invalid' })
    return
  }

  const dataFromDb = await db.get(path)
  if (!dataFromDb) {
    c.log('gray', 'failed to get nonexistant path', path)
    res.status(401).json({ message: 'Invalid' })
    return
  }

  delete (dataFromDb as any).hashedPassword
  c.log('gray', 'Sending data', path)
  res.json(dataFromDb)
})

export default routes
