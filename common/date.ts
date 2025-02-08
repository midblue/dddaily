import moment from 'moment'
import type { Moment } from 'moment'

export function dateString(
  d?: Moment | DateString | Date | null,
): DateString {
  // if (!d) {
  //   d = moment()
  //   // const userTimezoneOffset = moment().t()
  //   // const userTimezoneOffsetInMs =
  //   //   userTimezoneOffset * 60 * 1000
  //   // d = moment(d.getTime() + userTimezoneOffsetInMs)
  // }

  // const year = d.getFullYear()
  // let month: any = d.getMonth() + 1
  // if (month < 10) month = `0${month}`
  // let day: any = d.getDate()
  // if (day < 10) day = `0${day}`
  // // console.log(
  // //   'dateString',
  // //   date,
  // //   `${year}-${month}-${day}`,
  // // )
  // // console.trace()

  return moment(d || moment()).format(
    'YYYY-MM-DD',
  ) as DateString //`${year}-${month}-${day}`
}
export function dateTimeString(
  d?: Moment | DateString | DateTimeString,
): DateTimeString {
  // if (!d) {
  //   d = moment()
  //   // const userTimezoneOffset = moment().getTimezoneOffset()
  //   // const userTimezoneOffsetInMs =
  //   //   userTimezoneOffset * 60 * 1000
  //   // d = moment(d.getTime() + userTimezoneOffsetInMs)
  // }

  // const dateString = dateString(d)
  // let hours: any = d.getHours()
  // if (hours < 10) hours = `0${hours}`
  // let minutes: any = d.getMinutes()
  // if (minutes < 10) minutes = `0${minutes}`
  // let seconds: any = d.getSeconds()
  // if (seconds < 10) seconds = `0${seconds}`
  // let milliseconds: any = d.getMilliseconds()
  // if (milliseconds < 100) milliseconds = `00${milliseconds}`
  // if (milliseconds < 10) milliseconds = `0${milliseconds}`
  // return `${dateString}T${hours}:${minutes}:${seconds}.${milliseconds}`
  return moment(d || moment()).format(
    'YYYY-MM-DDTHH:mm:ss.SSS',
  ) as DateTimeString
}

export function addDaysToDate(
  date:
    | Moment
    | DateString
    | DateTimeString
    | null
    | undefined,
  days: number,
): Moment {
  // const dateAsMs = moment(date).
  // const newDateAsMs = dateAsMs + days * 24 * 60 * 60 * 1000
  // const newDate = moment(newDateAsMs)
  // return newDate
  return moment(date || moment()).add(days, 'days')
}

/**
 * @returns absolute value, integer
 */
export function daysBetween(
  a?: Moment | DateString | null | undefined,
  b?: Moment | DateString | null | undefined,
): number {
  // const userTimezoneOffset = moment().getTimezoneOffset()
  // const userTimezoneOffsetInMs =
  //   userTimezoneOffset * 60 * 1000

  // const aDate = moment(
  //   moment(a).getTime() + userTimezoneOffsetInMs,
  // )
  // const bDate = moment(
  //   moment(b).getTime() + userTimezoneOffsetInMs,
  // )

  // if (isNaN(aDate.getTime()) || isNaN(bDate.getTime()))
  //   throw new Error('Invalid date input')

  // return Math.floor(
  //   Math.abs(
  //     (aDate.getTime() - bDate.getTime()) /
  //       (1000 * 60 * 60 * 24),
  //   ),
  // )

  return Math.abs(
    moment(a || moment()).diff(b || moment(), 'days'),
  )
}

export function hour24ToHour12(hour24: number): string {
  if (hour24 === 0) return '12 AM'
  if (hour24 === 12) return '12 PM'
  if (hour24 > 12) return `${hour24 - 12} PM`
  return hour24 + ' AM'
}
