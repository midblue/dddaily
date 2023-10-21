import * as c from '~/../../common'
import bcrypt from 'bcrypt'

export function createNewUserData(data: {
  id: string
  password: string
  utcOffset?: number
}): UserConstructorData {
  return {
    type: 'User',
    id: data.id,
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
