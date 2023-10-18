import * as c from './common'
import { loadFullUserDataFromRemote } from './browser/storage/remote'
import { User } from './browser/DataStructure/User'

async function main() {
  const userData = await loadFullUserDataFromRemote('test')
  if (!userData) return

  const user = new User(userData)
  user.save()
}

main()
