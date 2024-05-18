import * as c from '../../common'
import { Router } from 'express'
import * as db from '../db/db'
// import * as bcrypt from 'bcrypt'

const routes = Router()

routes.post('/', async (req, res) => {
  const path = req.body.path as GettablePath
  if (!path || !Array.isArray(path) || path.length < 1) {
    c.log('gray', 'Invalid path')
    res.status(401).json({ message: 'Invalid' })
    return
  }
  let userId = path[0].id
  // const rawPassword = req.headers.authorization as string

  if (!userId) {
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

  // if (
  //   !bcrypt.compareSync(
  //     rawPassword,
  //     naiveUserData.hashedPassword ||
  //       '8929h30jrionu0vw9eijnfb20porqjwdnbwi9efsougbw3',
  //   )
  // ) {
  //   c.log('gray', 'Invalid password')
  //   res.status(401).json({ message: 'Invalid' })
  //   return
  // }

  c.log('gray', 'Removing', path)
  await db.remove(path)
  res.json({ ok: true })
})

export default routes
