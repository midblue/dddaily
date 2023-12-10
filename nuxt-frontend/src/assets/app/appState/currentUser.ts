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

export const currentUser: Ref<User | null> =
  ref<User | null>(null) as any

export const focusedDay: Ref<Date> = ref(new Date())
export const focusedDayIsToday = computed(() => {
  return (
    c.dateToDateString(focusedDay.value) ===
    c.dateToDateString(new Date())
  )
})

export let lastUserInteractionTimestampMs: Ref<number> =
  ref(Date.now())
export let windowIsFocused = ref(true)

const activeCutoffMs = 1000 * 60 * 5
export const userIsProbablyActivelyUsingApp = () => {
  return (
    Date.now() - lastUserInteractionTimestampMs.value <
    activeCutoffMs
  )
}

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
  currentUser.value.addPassiveHook(() => {
    if (currentUser.value?.today?.energy === undefined)
      useRouter().push('/moodCheck')
  })

  if (currentUser.value.today?.energy === undefined)
    useRouter().push('/moodCheck')
  else
    useRouter().push(
      `/day/${c.dateToDateString(focusedDay.value)}`,
    )

  return currentUser.value as User
}

setInterval(() => {
  if (
    currentUser.value &&
    !userIsProbablyActivelyUsingApp() &&
    currentUser.value?.today?.energy === undefined
  ) {
    c.log('Redirecting to mood check')
    useRouter().push('/moodCheck')
  }
}, 5000)

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
  const userData: UserConstructorData = {
    id,
    type: 'User',
    activityConstructors: [],
    clears: [],
  }
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
