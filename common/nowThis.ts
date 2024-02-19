import * as date from './date'

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

export function getUpdatedClears(
  oldClears: DatedResults,
): DatedResults {
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
      newClears.push(oldClear)
    } else {
      newClears.push({ date: dateString, clears: {} })
    }
    currentDate = date.dateToDateString(
      date.addDaysToDate(currentDate, 1),
    )
  }
  return newClears
}
