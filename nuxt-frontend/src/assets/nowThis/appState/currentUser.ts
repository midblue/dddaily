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

export let lastUserInteractionTimestampMs: Ref<number> =
  ref(Date.now())
export let windowIsFocused = ref(true)

const activeCutoffMs = 1000 * 60 * 5
export const userIsProbablyActivelyUsingApp = computed(
  () => {
    return (
      Date.now() - lastUserInteractionTimestampMs.value <
      activeCutoffMs
    )
  },
)

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
  currentUser.value.addDailyHook(goToNextDueActivity)
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

export const currentActivity = computed(() => {
  const id = useRoute()
    .path.split('/activity/')?.[1]
    ?.replace('settings/', '')
    ?.replace('complete/', '')
  if (!id) return null
  return currentUser.value?.activities.find(
    (a) => a.id === id,
  )
})

export const nextActivity = computed(() => {
  if (!currentActivity.value)
    return currentUser.value?.todaysActivities[0] || null
  const indexOfCurrentActivity =
    currentUser.value?.todaysActivities.findIndex(
      (a) => a.id === currentActivity.value?.id,
    )
  if (
    indexOfCurrentActivity === undefined ||
    indexOfCurrentActivity === -1
  )
    return null
  return currentUser.value?.todaysActivities[
    indexOfCurrentActivity + 1
  ]
})

export const previousActivity = computed(() => {
  const indexOfCurrentActivity =
    currentUser.value?.todaysActivities.findIndex(
      (a) => a.id === currentActivity.value?.id,
    )
  if (
    indexOfCurrentActivity === undefined ||
    indexOfCurrentActivity === -1
  )
    return null
  return currentUser.value?.todaysActivities[
    indexOfCurrentActivity - 1
  ]
})

export const nextDueActivity = computed(() => {
  return currentUser.value?.nextDueActivity || null
})

export function goToNextDueActivity() {
  const next = currentUser.value?.nextDueActivity
  if (!next) {
    if (currentUser.value?.didClearOnDate()) {
      useRouter().push('/fullClear')
      return
    }
    useRouter().push('/')
    return
  }
  useRouter().push(`/activity/${next.id}`)
}

export function skipCurrentActivityForToday() {
  if (!currentActivity.value) return
  currentActivity.value.skipToday = true
  goToNextDueActivity()
}

export function postponeCurrentActivity(hours = 1) {
  if (!currentActivity.value) return
  currentActivity.value.postponeForHours(hours)
  goToNextDueActivity()
}

export function activityComplete() {
  if (!currentActivity.value) {
    goToNextDueActivity()
    return
  }
  useRouter().push(
    `/activity/complete/${currentActivity.value?.id}`,
  )
}
