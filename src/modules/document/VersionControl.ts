import { Document } from './Document'
import { Item, ItemData } from './items/Item'

interface Commit {
  additions: ItemData[]
  changes: [ItemData, ItemData][]
  removals: ItemData[]
}

export class VersionControl {
  itemSnapshots = new Map<string, ItemData>()

  constructor (public document: Document) {
  }

  commit (title: string) {
    const additions: ItemData[] = []
    for (const id of this.document.itemForId.keys()) {
      if (!this.itemSnapshots.has(id)) {
        const data = this.document.itemForId.get(id)!.toData()
        additions.push(data)
      }
    }

    const removals: ItemData[] = []
    for (const id of this.itemSnapshots.keys()) {
      if (!this.document.itemForId.has(id)) {
        removals.push(this.itemSnapshots.get(id)!)
      }
    }

    const changes: [ItemData, ItemData][] = []
    for (const item of this.document.itemForId.values()) {
      if (item.isDirty) {
        const oldData = this.itemSnapshots.get(item.id)
        if (oldData) {
          const newData = item.toData()
          changes.push([oldData, newData])
        }
      }
    }
  }
}
