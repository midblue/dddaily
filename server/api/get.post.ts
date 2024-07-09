import * as c from '../../common'
import * as db from '../db/db'
import getAuthedUser from '../getAuthedUser'

export default defineEventHandler(async (event) => {
  const user = await getAuthedUser(event)
  if (!user) {
    return { status: 401, body: { message: 'Invalid' } }
  }

  const body = await readBody(event)
  // c.log('gray', '/get POST request', body)

  const path = body.path as GettablePath
  if (!path || !Array.isArray(path) || path.length < 1) {
    c.log('gray', '  Invalid path')
    return {
      status: 401,
      body: { message: 'Invalid path' },
    }
  }

  const userInPath = path[0].id
  if (userInPath !== user.id) {
    c.log('gray', '  User not authorized to get data')
    return { status: 401, body: { message: 'Invalid' } }
  }

  const dataFromDb = await db.get(path)
  if (!dataFromDb) {
    c.log('gray', '  Failed to get nonexistant path', path)
    return { status: 401, body: { message: 'Invalid' } }
  }

  delete (dataFromDb as any).hashedPassword
  c.log(
    'gray',
    `  Sending ${JSON.stringify(dataFromDb).length} chars`,
  )
  return { status: 200, body: dataFromDb }
})
