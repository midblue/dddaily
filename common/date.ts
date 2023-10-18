export function dateToDateString(d?: Date): DateString {
  const date = d || new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month}-${day}`
}
export function dateToDateTimeString(
  d?: Date,
): DateTimeString {
  const date = d || new Date()
  const dateString = dateToDateString(date)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${dateString}T${hours}:${minutes}`
}

export function newClearString(d?: Date): ClearString {
  const date = d || new Date()
  const dateString = dateToDateString(date)
  return `${dateString}_`
}
