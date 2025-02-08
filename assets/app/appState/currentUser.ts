import moment from 'moment'
import type { Moment } from 'moment'

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
import type { Entity } from '../DataStructure/Entity'

export const loadingUser = ref(false)
export const currentUser: Ref<User | null> =
  ref<User | null>(null) as any
export const currentPassword: Ref<string> = ref('')

export const focusedDate: Ref<DateString> = ref(
  c.dateString(),
)
export const focusedDateIsToday = computed(() => {
  return c.daysBetween(null, focusedDate.value) === 0
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

  c.log('Loading user', id, '...')
  loadingUser.value = true

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
    c.log('Redirecting to login')
    useRouter().push('/login')
    return { error: 'Incorrect password.' }
    // const user = await createUser(id, password)
    // return user
  }

  c.log('Loaded user', id, userData)
  loadingUser.value = false

  currentUser.value = new User(userData)
  currentUser.value.addHook('onSaveFail', onSaveFail)
  if (useRouter().currentRoute.value.path === '/login') {
    c.log('Redirecting to index from login')
    useRouter().push('/')
  }

  currentUser.value.passiveReset()
  currentUser.value.addHook('afterPassiveUpdate', () => {
    // c.log('passive reset')
    if (
      currentUser.value?.today?.energy === undefined &&
      useRoute().path !== '/moodCheck'
    ) {
      c.log(
        `Redirecting to mood check because today's energy is ${currentUser.value?.today?.energy}`,
      )
      useRouter().push('/moodCheck')
    } else if (
      currentUser.value?.today?.energy !== undefined &&
      useRoute().path === '/moodCheck'
    ) {
      c.log('Redirecting to today')
      useRouter().push(`/day/${c.dateString()}`)
    }
  })

  if (
    currentUser.value.today?.energy === undefined &&
    useRoute().path !== '/moodCheck'
  ) {
    c.log(
      'gray',
      `Redirecting to mood check because today's energy is ${currentUser.value.today?.energy}`,
    )
    useRouter().push('/moodCheck')
  } else {
    c.log('gray', 'Redirecting to day', focusedDate.value)
    useRouter().push(`/day/${focusedDate.value}`)
  }

  c.log('exhaustive date logs:', {
    focusedDate: focusedDate.value,
    focusedDateIsToday: focusedDateIsToday.value,
    now: moment(),
    dateString: c.dateString(),
    timeString: c.dateTimeString(),
    daysBetweenFocused: c.daysBetween(
      null,
      focusedDate.value,
    ),
    daysBetweenNow: c.daysBetween(null, null),
    userToday: JSON.parse(
      JSON.stringify(currentUser.value?.today || {}),
    ),
    userDay: JSON.parse(
      JSON.stringify(
        currentUser.value?.getDay(focusedDate.value) || {},
      ),
    ),
    userAllClears: JSON.parse(
      JSON.stringify(currentUser.value?.clears || {}),
    ),
  })

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
  const userData: UserConstructorData = {
    id,
    type: 'User',
    activityConstructors: [],
    clears: [],
  }
  currentUser.value = new User(userData)
  currentUser.value.addHook('onSaveFail', onSaveFail)
  currentUser.value.save()
  return currentUser.value as User
}

export function logOut() {
  c.log('Logging out')
  setUserId('')
  setPassword('')
  useRouter().push('/login')
  currentUser.value = null
}

export async function onSaveFail(
  announcer: Entity,
  bubbledFrom?: Entity,
) {
  c.log('save failed', { announcer, bubbledFrom })

  if (!(await networkCheck())) {
    useRouter().push('/offline')
  }
}
