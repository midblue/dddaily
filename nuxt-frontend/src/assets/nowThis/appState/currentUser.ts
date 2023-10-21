import * as c from '~/../../common'
import { User } from '../DataStructure/User'
import { loadFullUserData } from '../storage/storage'
export {
  getPassword,
  setPassword,
  getUserId,
  setUserId,
} from '../storage/local'
import {
  getUserId,
  setPassword,
  setUserId,
} from '../storage/local'
import { createNewUserData } from '../dataManipulation/user/createNewUser'

export const currentUser: Ref<User | null> =
  ref<User | null>(null) as any

export async function loadUser(
  id?: string,
): Promise<User | null> {
  if (!id) id = getUserId()
  else {
    setUserId(id)
  }
  if (!id) {
    useRouter().push('/logIn')
    return null
  }

  const userData = await loadFullUserData(id)
  if (!userData) {
    useRouter().push('/logIn')
    return null
  }
  currentUser.value = new User(userData)
  currentUser.value.passiveReset()

  return currentUser.value as User
}

export async function createUser(
  id: string,
  password: string,
): Promise<User> {
  setUserId(id)
  setPassword(password)
  const existing = await loadFullUserData(id)
  if (existing) {
    throw new Error('User already exists')
  }
  const userData = createNewUserData({ id, password })
  currentUser.value = new User(userData)
  currentUser.value.save()
  return currentUser.value as User
}

export function logOut() {
  setUserId('')
  setPassword('')
  useRouter().push('/logIn')
  currentUser.value = null
}
