import { Document } from './Document'
import { ItemData } from './items/Item'
import { UndoStack, UndoCommand } from '../../util/UndoStack'
import { itemFromData } from './items/ItemPack'

export class Commit implements UndoCommand {
  constructor (
    public readonly versionControl: VersionControl, public readonly title: string,
    public readonly additions: ItemData[], public readonly removals: ItemData[], public readonly changes: [ItemData, ItemData][]
  ) {
  }

  get document () {
    return this.versionControl.document
  }

  revert () {
    const reversedChanges = this.changes.map((c): [ItemData, ItemData] => [c[1], c[0]])
    return new Commit(this.versionControl, `Revert ${this.title}`, this.removals, this.additions, reversedChanges)
  }

  undo () {
    this.revert().redo()
  }

  redo () {
    for (const addition of this.additions) {
      itemFromData(this.document, addition, addition.id) // just create item
      this.document.versionControl.updateSnapshot(addition)
    }
    for (const addition of this.additions) {
      const item = this.document.itemForId.get(addition.id)
      if (item) {
        item.loadChildren(addition.childIds)
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
        item.loadChildren(newData.childIds)
        this.document.versionControl.updateSnapshot(newData)
      }
    }
  }
}

export class VersionControl {
  commitHistory = new UndoStack<Commit>()
  private itemSnapshots = new Map<string, ItemData>()

  constructor (public document: Document) {
    for (const item of document.rootItem.allDescendants()) {
      this.updateSnapshot(item.toData())
    }
  }

  commit (title: string) {
    this.document.disposeUnreferencedItems()

    const additions: ItemData[] = []
    for (const id of this.document.itemForId.keys()) {
      if (!this.itemSnapshots.has(id)) {
        const data = this.document.itemForId.get(id)!.toData()
        this.updateSnapshot(data)
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
        this.updateSnapshot(newData)
        item.isDirty = false
      }
    }

    const commit = new Commit(this, title, additions, removals, changes)
    this.commitHistory.push(commit)
  }

  updateSnapshot (data: ItemData) {
    this.itemSnapshots.set(data.id, data)
  }
}
