import * as c from '~/../../common'

export function createIdentityData<
  T extends IdentityConstructorData,
>({
  name,
}: {
  name?: string
  prompt?: string
  maxTimeInMinutes?: number
} = {}): T {
  const identityData: IdentityConstructorData & {
    prompt?: string
  } = {
    type: 'Identity',
    id: c.id('Identity'),
    name: name || 'New Identity Goal',
    clears: c.newClearString(),
    xp: 0,
  }

  return identityData as T
}
