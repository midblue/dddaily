import * as c from '../../../../../../common'
import bcrypt from 'bcrypt'

export function createNewUserData(data: {
  id: string
  password: string
  utcOffset?: number
}): UserConstructorData {
  const hashedPassword = bcrypt.hashSync(data.password, 10)

  return {
    type: 'User',
    id: data.id,
    hashedPassword,
    activityConstructors: [],
    identityConstructors: [],
    utcOffset: data.utcOffset,
    bonusActivities: [],
    muted: false,
    clears: c.newClearString(),
    clearFrequencyInDays: 1,
    xp: 0,
  }
}
