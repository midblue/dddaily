import * as date from './date'
import { log } from './log'

export const colors: [number, number, number][] = [
  [3, 73, 58],
  [19, 81, 55],
  [30, 82, 58],
  [43, 86, 55],
  [84, 66, 41],
  [160, 36, 46],
  [181, 40, 35],
  [178, 50, 54],
  [215, 15, 56],
  [212, 61, 45],
  [217, 90, 60],
  [293, 73, 78],
  [310, 10, 60],
  [312, 28, 46],
  [320, 70, 59],
  [348, 97, 69],
]

/**
 * Updates the list of clears by iterating from the earliest clear date
 * or yesterday if no clears exist, up to today. For each date in this range,
 * it checks if an entry exists in the old clears and adds it to the new
 * clears if not already present. If no entry exists for a date, it creates
 * a new entry with an empty clears object. This process continues until
 * today's date is reached or a maximum of 1000 iterations is performed.
 *
 * @param oldClears - The existing list of clears to be updated.
 * @returns A new list of clears with entries for each day up to today.
 */

export function getUpdatedClears(
  oldClears: DatedResults,
): DatedResults {
  log('Updating clears...')
  const startDateString =
    oldClears?.[0]?.date ||
    date.dateToDateString(
      date.addDaysToDate(new Date(), -1),
    )
  const newClears: DatedResults = []
  let currentDate = startDateString
  const today = date.dateToDateString()
  let attempts = 0
  while (currentDate <= today && attempts < 1000) {
    attempts++
    const dateString = currentDate
    const oldClear = oldClears.find(
      (c) => c.date === dateString,
    )
    if (oldClear) {
      if (!newClears.find((c) => c.date === dateString))
        newClears.push(oldClear)
      else
        log(
          'Duplicate entry for date',
          dateString,
          newClears.find((c) => c.date === dateString),
          oldClear,
          ' - skipping',
        )
    } else {
      log('No entry for date', dateString, ' - creating')
      // * this is causing data loss if there is a network isssue
      newClears.push({ date: dateString, clears: {} })
    }
    currentDate = date.dateToDateString(
      date.addDaysToDate(currentDate, 1),
    )
  }

  // prune trailing days with no assigned activities
  while (
    Object.keys(newClears[0].clears).length === 0 &&
    newClears.length > 2
  ) {
    newClears.shift()
  }

  return newClears
}
