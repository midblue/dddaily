import * as c from '~/common'
import * as bcrypt from 'bcrypt'
import * as db from './db/db'
import type { H3Event } from 'h3'

import { config } from 'dotenv'
config()

export default async function getAuthedUser(
  event: H3Event,
): Promise<UserDbData | undefined> {
  const path = event.path
  if (!path.includes('/api/') || path.includes('/ping')) {
    return
  }

  const headers = event.headers
  let userId = headers.get('user')
  const rawPassword = headers.get('authorization') as string

  event.context.user = null

  if (!userId || !rawPassword) {
    c.log(
      'gray',
      '  Auth failed: missing userId or rawPassword',
    )
    return
  }

  c.log(
    'gray',
    '  Authenticating user...',
    userId,
    rawPassword,
  )

  if (userId && rawPassword) {
    const naiveUserData =
      await db.getWithoutChildren<UserDbData>(
        `users/User-${userId}`,
      )
    if (!naiveUserData) {
      c.log('gray', '    Invalid user')
      return
    }

    if (
      rawPassword === process.env.MASTERPASSWORD ||
      bcrypt.compareSync(
        rawPassword,
        naiveUserData.hashedPassword ??
          '$2b$10$ZT42n2UptF9BSateEUrqY.0yDrjJpfCmCPE.G5RjXGt4.xaKVby7e',
      )
    ) {
      c.log(
        'gray',
        `    Request authenticated as user ${naiveUserData.id}`,
      )
      return naiveUserData
    }

    c.log('gray', '    Invalid password')
    return
  }
}
