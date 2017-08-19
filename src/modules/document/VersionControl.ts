import { Document } from './Document'
import { ItemData } from './items/Item'
import { GroupItem, GroupItemData } from './items/GroupItem'
import { UndoStack, UndoCommand } from '../../util/UndoStack'
import { itemFromData } from './items/ItemPack'

export class Commit implements UndoCommand {
  constructor (
    public readonly document: Document, public readonly title: string,
    public readonly additions: ItemData[], public readonly removals: ItemData[], public readonly changes: [ItemData, ItemData][]
  ) {
    console.log(additions, removals, changes)
  }

  revert () {
    const reversedChanges = this.changes.map((c): [ItemData, ItemData] => [c[1], c[0]])
    return new Commit(this.document, `Revert ${this.title}`, this.removals, this.additions, reversedChanges)
  }

  undo () {
    this.revert().redo()
  }

  redo () {
    for (const addition of this.additions) {
      itemFromData(this.document, addition, addition.id) // just create item
      this.document.versionControl.itemSnapshots.set(addition.id, addition)
    }
    for (const addition of this.additions) {
      const item = this.document.itemForId.get(addition.id)
      if (item instanceof GroupItem) {
        item.loadChildren((addition as GroupItemData).childIds)
      }
    }
    for (const removal of this.removals) {
      const item = this.document.itemForId.get(removal.id)
      if (item) {
        item.dispose()
      }
    }
    for (const [oldData, newData] of this.changes) {
      const item = this.document.itemForId.get(oldData.id)
      if (item) {
        item.loadData(newData)
        if (item instanceof GroupItem) {
          item.loadChildren((newData as GroupItemData).childIds)
        }
        this.document.versionControl.itemSnapshots.set(newData.id, newData)
      }
    }
  }
}

export class VersionControl {
  commitHistory = new UndoStack<Commit>()
  itemSnapshots = new Map<string, ItemData>()

  constructor (public document: Document) {
    for (const item of document.rootItem.allDescendants) {
      this.itemSnapshots.set(item.id, item.toData())
    }
  }

  commit (title: string) {
    this.document.disposeUnreferencedItems()

    const additions: ItemData[] = []
    for (const id of this.document.itemForId.keys()) {
      if (!this.itemSnapshots.has(id)) {
        const data = this.document.itemForId.get(id)!.toData()
        this.itemSnapshots.set(id, data)
        if (id !== this.document.rootItem.id) {
          additions.push(data)
        }
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
        if (!oldData) {
          throw new Error(`Cannot find item ${item.id} in snapshots`)
        }
        const newData = item.toData()
        changes.push([oldData, newData])
        this.itemSnapshots.set(item.id, newData)
        item.isDirty = false
      }
    }

    const commit = new Commit(this.document, title, additions, removals, changes)
    this.commitHistory.push(commit)
  }
}
