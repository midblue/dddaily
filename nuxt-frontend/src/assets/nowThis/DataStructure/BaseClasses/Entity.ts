import * as c from '~/../../common'
import {
  saveElement,
  removeElement,
} from '../../storage/storage'
import { loadElementFromRemote } from '../../storage/remote'

export abstract class Entity {
  id: string
  abstract type: EntityType
  updated: DateTimeString
  created: DateTimeString
  promptCount: number
  parent: any

  private awaitingSave: boolean = false

  constructor(
    data: EntityConstructorData,
    parent: any = null,
  ) {
    this.id = data.id || c.id()
    this.updated =
      data.updated ||
      data.created ||
      c.dateToDateTimeString()
    this.created = data.created || c.dateToDateTimeString()
    this.promptCount = data.promptCount || 0
    this.parent = parent
  }

  // implemented in extending classes
  dailyReset(): void {}
  passiveReset(): void {}

  getSaveableData(): EntityConstructorData {
    return {
      id: this.id,
      type: this.type,
      updated: this.updated,
      created: this.created,
      promptCount: this.promptCount,
    }
  }

  get parentPath(): GettablePath {
    const parentPath: { type: EntityType; id: string }[] =
      []
    let parent = this.parent
    while (parent) {
      parentPath.push({ type: parent.type, id: parent.id })
      parent = parent.parent
    }
    parentPath.reverse()
    return parentPath
  }

  get gettablePath(): GettablePath {
    return [
      ...this.parentPath,
      { type: this.type, id: this.id },
    ]
  }

  async save<T>(): Promise<void> {
    let updatedDate = new Date()
    while (this.awaitingSave) await c.sleep(100)
    if (this.updated > c.dateToDateTimeString(updatedDate))
      return
    this.updated = c.dateToDateTimeString(updatedDate)

    this.awaitingSave = true
    const dataToSave = this.getSaveableData()

    const saveRes = await saveElement({
      elementToSave: dataToSave,
      parentPath: this.parentPath,
    })
    this.awaitingSave = false
    c.l(
      `Save result for ${this.constructor.name} ${this.id}:`,
      saveRes,
    )
  }

  async remove() {
    const removeRes = await removeElement(this.gettablePath)
    c.l(
      `Remove result for ${this.constructor.name} ${this.id}:`,
      removeRes,
    )
    return removeRes
  }

  async reloadSelfFromRemote() {
    const res = await loadElementFromRemote(
      this.gettablePath,
    )
    if (!res) return

    for (let key in Object.keys(res)) {
      if (!this.hasOwnProperty(key)) continue
      this[key] = res[key]
    }
  }
}
