import * as c from '../../common'
import * as db from '../db/db'

export default defineEventHandler(async (event) => {
  const id = `${getQuery(event)?.id || ''}`
  c.log('gray', '  Checking on server if user exists:', id)
  if (!id) {
    setResponseStatus(event, 400)
    return {
      status: 400,
      body: { error: `id is required` },
    }
  }
  const dataFromDb = await db.get([{ id, type: 'User' }])
  c.log('gray', '    User exists:', !!dataFromDb)
  setResponseStatus(event, 200)
  if (!dataFromDb) {
    return { status: 200, body: { exists: false } }
  }
  return { status: 200, body: { exists: true } }
})
