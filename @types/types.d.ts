/** YYYY-MM-DD */
type DateString = `${number}-${number}-${number}`
/** TT:TT */
type TimeString = `${number}:${number}`
/** YYYY-MM-DDThh:mm */
type DateTimeString = `${DateString}T${TimeString}`
/** YYYY-MM-DD_01010101 (0 being not cleared, 1 being cleared) */
type ClearString = `${DateString}_${string}`

type EntityType =
  | 'User'
  | 'Activity'
  | 'Identity'
  | 'FlashCard'

interface SaveableData {
  elementToSave: EntityConstructorData
  parentPath: { type: EntityType; id: string }[]
}
