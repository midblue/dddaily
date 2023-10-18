import * as c from '../../../../../../common'
import { loadElementFromRemote } from '../../storage/remote'
import { saveElement } from '../../storage/storage'

export abstract class Entity {
  id: string
  abstract type: EntityType
  updated: DateTimeString
  created: DateTimeString
  aiPromptCount: number
  parent: any

  constructor(
    data: EntityConstructorData,
    parent: any = null,
  ) {
    this.id = data.id
    this.updated =
      data.updated ||
      data.created ||
      c.dateToDateTimeString()
    this.created = data.created || c.dateToDateTimeString()
    this.aiPromptCount = data.aiPromptCount || 0
    this.parent = parent
  }

  // implemented in extending classes
  dailyReset(): void {}

  getSaveableData(): EntityConstructorData {
    return {
      id: this.id,
      type: this.type,
      updated: this.updated,
      created: this.created,
      aiPromptCount: this.aiPromptCount,
    }
  }

  private get parentPath(): {
    type: EntityType
    id: string
  }[] {
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

  async save<T>(keys?: (keyof T)[]): Promise<void> {
    const dataToSave = this.getSaveableData()
    if (keys) {
      Object.keys(dataToSave).forEach((key) => {
        if (!keys.includes(key as any)) {
          delete dataToSave[key]
        }
      })
    }

    const saveRes = await saveElement({
      elementToSave: dataToSave,
      parentPath: this.parentPath,
    })
    c.l(
      `Save result for ${this.constructor.name} ${this.id}:`,
      saveRes,
    )
  }

  async reloadSelfFromRemote() {
    const res = await loadElementFromRemote(
      this.id,
      this.parentPath,
    )
    if (!res) return

    for (let key in Object.keys(res)) {
      this[key] = res[key]
    }
  }
}
