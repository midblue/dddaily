import * as c from '../../common'
import * as db from '../db/db'
import getAuthedUser from '../getAuthedUser'

export default defineEventHandler(async (event) => {
  const user = await getAuthedUser(event)
  if (!user) {
    return { status: 401, body: { message: 'Invalid' } }
  }

  const body = await readBody(event)
  // c.log('gray', '/remove POST request', body)

  const path = body.path as GettablePath
  if (!path || !Array.isArray(path) || path.length < 1) {
    return {
      status: 401,
      body: { message: 'Invalid path' },
    }
  }

  const userInPath =
    body.path[0]?.id ||
    (body.elementToSave.type === 'User'
      ? (body.elementToSave as any).id
      : 'x')
  if (userInPath !== user.id) {
    c.log('gray', '  User not authorized to remove data')
    return { status: 401, body: { message: 'Invalid' } }
  }

  const naiveUserData =
    await db.getWithoutChildren<UserDbData>(
      `users/User-${userInPath}`,
    )
  if (!naiveUserData) {
    return { status: 401, body: { message: 'Invalid' } }
  }

  c.log('gray', '  Removing', path)
  await db.remove(path)
  return { status: 200, body: { ok: true } }
})
