import * as c from '../../../../../../common'

export function createActivityData(data: {
  activityType: ActivityType
  name?: string
}): ActivityConstructorData {
  const activityData: ActivityConstructorData = {
    ...data,
    type: 'Activity',
    id: c.id('Activity'),
    name: data.name || `New ${data.activityType} Activity`,
    clears: c.newClearString(),
    xp: 0,
  }
  return activityData
}
