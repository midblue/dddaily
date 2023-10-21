export function dateToDateString(d?: Date): DateString {
  const date = d || new Date()
  const year = date.getFullYear()
  let month: any = date.getMonth() + 1
  if (month < 10) month = `0${month}`
  let day: any = date.getDate()
  if (day < 10) day = `0${day}`
  return `${year}-${month}-${day}`
}
export function dateToDateTimeString(
  d?: Date,
): DateTimeString {
  const date = d || new Date()
  const dateString = dateToDateString(date)
  let hours: any = date.getHours()
  if (hours < 10) hours = `0${hours}`
  let minutes: any = date.getMinutes()
  if (minutes < 10) minutes = `0${minutes}`
  let seconds: any = date.getSeconds()
  if (seconds < 10) seconds = `0${seconds}`
  let milliseconds: any = date.getMilliseconds()
  if (milliseconds < 10) milliseconds = `0${milliseconds}`
  return `${dateString}T${hours}:${minutes}:${seconds}.${milliseconds}`
}

export function newClearString(d?: Date): ClearString {
  const date = d || new Date()
  const dateString = dateToDateString(date)
  return `${dateString}_`
}

export function getUpdatedClearString(
  oldClearString: ClearString,
): ClearString {
  const startDateString = oldClearString.split(
    '_',
  )[0] as DateString
  const clearBoolFlags = oldClearString.split('_')[1]
  let newClearString: ClearString = (startDateString +
    '_') as ClearString
  let index = 0
  let currentDay = new Date(startDateString)
  while (currentDay.getTime() < new Date().getTime()) {
    const clear = clearBoolFlags[index] === '1'
    newClearString += clear ? '1' : '0'

    currentDay = addDaysToDate(currentDay, 1)
    index++
  }
  return newClearString
}

export function datedClearBooleanArrayToClearString(
  datedClearBooleanArray: {
    date: Date
    clear: boolean
  }[],
): ClearString {
  let clearString = `${dateToDateString(
    datedClearBooleanArray[0].date,
  )}_`
  for (let datedClearBoolean of datedClearBooleanArray) {
    clearString += datedClearBoolean.clear ? '1' : '0'
  }
  return clearString as ClearString
}

export function addDaysToDate(
  date: Date,
  days: number,
): Date {
  const dateAsMs = new Date(date).getTime()
  const newDateAsMs = dateAsMs + days * 24 * 60 * 60 * 1000
  const newDate = new Date(newDateAsMs)
  return newDate
}
