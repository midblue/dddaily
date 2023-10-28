import e from 'express'

export const activityTypeLabels: Record<string, string> = {
  General: 'Activity',
  CheckIn: 'Check-In',
}

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

export const levels: number[] = []
for (let i = 0; i < 2000; i++) {
  levels.push(40 * i * (i / 2))
}

export function xpToLevel(xp: number) {
  let level = 0
  for (let i = 0; i < levels.length; i++) {
    if (xp < levels[i]) {
      break
    }
    level++
  }
  return level
}

export function levelToXp(level: number) {
  return levels[level - 1]
}

export function levelProgress(xp: number) {
  const level = xpToLevel(xp)
  return (
    (xp - levels[level - 1]) /
    (levels[level] - levels[level - 1])
  )
}
export function totalXPInLevel(level: number) {
  return levels[level] - (levels[level - 1] || 0)
}
