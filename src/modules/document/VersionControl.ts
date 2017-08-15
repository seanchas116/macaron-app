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

  onItemAdd (item: Item) {
    this.itemSnapshots.set(item.id, item.toData())
  }

  onItemRemove (item: Item) {
    this.itemSnapshots.delete(item.id)
  }

  commit (title: string) {
  }
}
