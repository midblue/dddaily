import * as c from '~/../../common'

export function createActivityData<
  T extends ActivityConstructorData & { prompt?: string },
>(data: {
  activityType: ActivityType
  name?: string
  prompt?: string
}): T {
  const activityData: ActivityConstructorData & {
    prompt?: string
  } = {
    ...data,
    type: 'Activity',
    id: c.id('Activity'),
    name: data.name || `New ${data.activityType} Activity`,
    clears: c.newClearString(),
    xp: 0,
    prompt: data.prompt,
  }

  return activityData as T
}
