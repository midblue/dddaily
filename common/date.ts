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
  a: Date | string,
  b: Date | string,
): number {
  const aDate = new Date(a)
  const bDate = new Date(b)

  // Normalize to the start of the respective calendar days
  aDate.setHours(0, 0, 0, 0)
  bDate.setHours(0, 0, 0, 0)

  return Math.abs(
    (aDate.getTime() - bDate.getTime()) /
      (1000 * 60 * 60 * 24),
  )
}

export function hour24ToHour12(hour24: number): string {
  if (hour24 === 0) return '12 AM'
  if (hour24 === 12) return '12 PM'
  if (hour24 > 12) return `${hour24 - 12} PM`
  return hour24 + ' AM'
}
