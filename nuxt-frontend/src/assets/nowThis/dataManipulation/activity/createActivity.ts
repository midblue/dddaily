import * as c from '~/../../common'

export function createActivityData<
  T extends ActivityConstructorData & { prompt?: string },
>({
  activityType = 'General',
  name,
  prompt,
  maxTimeInMinutes,
}: {
  activityType?: ActivityType
  name?: string
  prompt?: string
  maxTimeInMinutes?: number
} = {}): T {
  const activityData: ActivityConstructorData & {
    prompt?: string
  } = {
    type: 'Activity',
    activityType,
    id: c.id('Activity'),
    name: name || 'New Activity',
    clears: c.newClearString(),
    xp: 0,
    prompt,
    maxTimeInMinutes,
  }

  return activityData as T
}
