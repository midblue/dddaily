import * as c from '~/../../common'
import { ClearableWithXP } from './BaseClasses/ClearableWithXP'

export class Identity extends ClearableWithXP {
  type: EntityType = 'Identity'
  name: string

  constructor(
    data: IdentityConstructorData,
    parent: any = null,
  ) {
    super(data, parent)
    this.name = data.name
  }

  dailyReset() {
    super.dailyReset()
  }

  getSaveableData(): IdentityConstructorData {
    return {
      ...super.getSaveableData(),
      name: this.name,
    }
  }
}
