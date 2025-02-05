export function dateToDateString(d?: Date): DateString {
  if (!d) {
    d = new Date()
    const userTimezoneOffset =
      new Date().getTimezoneOffset()
    const userTimezoneOffsetInMs =
      userTimezoneOffset * 60 * 1000
    d = new Date(d.getTime() + userTimezoneOffsetInMs)
  }

  const year = d.getFullYear()
  let month: any = d.getMonth() + 1
  if (month < 10) month = `0${month}`
  let day: any = d.getDate()
  if (day < 10) day = `0${day}`
  // console.log(
  //   'dateToDateString',
  //   date,
  //   `${year}-${month}-${day}`,
  // )
  // console.trace()
  return `${year}-${month}-${day}`
}
export function dateToDateTimeString(
  d?: Date,
): DateTimeString {
  if (!d) {
    d = new Date()
    const userTimezoneOffset =
      new Date().getTimezoneOffset()
    const userTimezoneOffsetInMs =
      userTimezoneOffset * 60 * 1000
    d = new Date(d.getTime() + userTimezoneOffsetInMs)
  }

  const dateString = dateToDateString(d)
  let hours: any = d.getHours()
  if (hours < 10) hours = `0${hours}`
  let minutes: any = d.getMinutes()
  if (minutes < 10) minutes = `0${minutes}`
  let seconds: any = d.getSeconds()
  if (seconds < 10) seconds = `0${seconds}`
  let milliseconds: any = d.getMilliseconds()
  if (milliseconds < 100) milliseconds = `00${milliseconds}`
  if (milliseconds < 10) milliseconds = `0${milliseconds}`
  return `${dateString}T${hours}:${minutes}:${seconds}.${milliseconds}`
}

export function addDaysToDate(
  date: Date | DateString | DateTimeString,
  days: number,
): Date {
  const dateAsMs = new Date(date).getTime()
  const newDateAsMs = dateAsMs + days * 24 * 60 * 60 * 1000
  const newDate = new Date(newDateAsMs)
  return newDate
}

export function daysBetween(
  a: Date | DateString,
  b: Date | DateString,
): number {
  const userTimezoneOffset = new Date().getTimezoneOffset()
  const userTimezoneOffsetInMs =
    userTimezoneOffset * 60 * 1000

  const aDate = new Date(
    new Date(a).getTime() + userTimezoneOffsetInMs,
  )
  const bDate = new Date(
    new Date(b).getTime() + userTimezoneOffsetInMs,
  )

  if (isNaN(aDate.getTime()) || isNaN(bDate.getTime()))
    throw new Error('Invalid date input')

  return Math.floor(
    Math.abs(
      (aDate.getTime() - bDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )
}

export function hour24ToHour12(hour24: number): string {
  if (hour24 === 0) return '12 AM'
  if (hour24 === 12) return '12 PM'
  if (hour24 > 12) return `${hour24 - 12} PM`
  return hour24 + ' AM'
}
