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
import { networkCheck } from './general'

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
  if (!(await networkCheck())) {
    c.log('app is offline')
    useRouter().push('/offline')
    return null
  }
  if (!id) id = getUserId()
  else {
    setUserId(id)
  }
  if (!id) {
    useRouter().push('/login')
    return null
  }

  c.log('Loading user', id)

  const userData = await loadFullUserData(id)
  if (!userData) {
    const user = await createUser(id)
    return user
  }

  c.log('Loaded user', id, userData)

  currentUser.value = new User(userData)
  currentUser.value.passiveReset()
  currentUser.value.addPassiveHook(() => {
    if (
      currentUser.value?.today?.energy === undefined &&
      useRoute().path !== '/moodCheck'
    )
      useRouter().push('/moodCheck')
  })

  if (currentUser.value.today?.energy === undefined) {
    c.log('gray', 'Redirecting to mood check')
    useRouter().push('/moodCheck')
  } else {
    c.log('gray', 'Redirecting to day', focusedDay.value)
    useRouter().push(
      `/day/${c.dateToDateString(focusedDay.value)}`,
    )
  }

  return currentUser.value as User
}

setInterval(() => {
  if (
    currentUser.value &&
    !userIsProbablyActivelyUsingApp() &&
    currentUser.value?.today?.energy === undefined &&
    useRoute().path !== '/moodCheck'
  ) {
    c.log('Redirecting to mood check')
    useRouter().push('/moodCheck')
  }
}, 5000)

export async function createUser(
  id: string,
  // password: string,
): Promise<User> {
  setUserId(id)
  // setPassword(password)
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
  // setPassword('')
  useRouter().push('/login')
  currentUser.value = null
}
