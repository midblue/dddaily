export function pickMoreRecentEntity(
  a: EntityConstructorData,
  b: EntityConstructorData,
): EntityConstructorData {
  const moreRecent =
    new Date(a.updated || 0).getTime() >
    new Date(b.updated || 0).getTime()
      ? a
      : b

  const merged = moreRecent

  return merged
}
