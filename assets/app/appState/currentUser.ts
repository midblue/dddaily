import * as c from '~/common'
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
  getPassword,
  setUserId,
} from '../storage/local'
import { networkCheck } from './general'
import { checkUserExists } from '../storage/remote'

export const currentUser: Ref<User | null> =
  ref<User | null>(null) as any
export const currentPassword: Ref<string> = ref('')

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

// let isLoadingUser = false
export async function loadUser(
  id?: string,
  password?: string,
): Promise<User | { error: string }> {
  if (!(await networkCheck())) {
    c.log('app is offline')
    useRouter().push('/offline')
    return { error: 'App is offline.' }
  }
  if (!id) id = getUserId()
  else setUserId(id)
  if (!password) password = getPassword()
  else setPassword(password)
  currentPassword.value = password

  if (!id || !password) {
    c.log('No user id, redirecting to login')
    useRouter().push('/login')
    return { error: 'Missing either username or password.' }
  }

  // if (isLoadingUser) {
  //   c.log('Already loading user')
  //   return { error: 'Already loading user.' }
  // }

  c.log('Loading user', id, '...')
  // isLoadingUser = true

  const userData = await loadFullUserData(id)
  if (!userData) {
    c.log('User not accessible with those credentials', id)

    const exists = await checkUserExists(id)
    if (!exists) {
      c.log('User does not exist, creating', id)
      return createUser(id, password)
    }
    c.log(
      'User exists, but not accessible (wrong password)',
      id,
    )
    useRouter().push('/login')
    return { error: 'Incorrect password.' }
    // const user = await createUser(id, password)
    // return user
  }

  c.log('Loaded user', id, userData)
  // isLoadingUser = false

  currentUser.value = new User(userData)
  if (useRouter().currentRoute.value.path === '/login') {
    useRouter().push('/')
  }

  currentUser.value.passiveReset()
  currentUser.value.addPassiveHook(() => {
    if (
      currentUser.value?.today?.energy === undefined &&
      useRoute().path !== '/moodCheck'
    ) {
      c.log('Redirecting to mood check')
      useRouter().push('/moodCheck')
    } else if (
      currentUser.value?.today?.energy !== undefined &&
      useRoute().path === '/moodCheck'
    ) {
      c.log('Redirecting to today')
      useRouter().push(
        `/day/${c.dateToDateString(new Date())}`,
      )
    }
  })

  if (
    currentUser.value.today?.energy === undefined &&
    useRoute().path !== '/moodCheck'
  ) {
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
  useRouter().push('/login')
  currentUser.value = null
}
