import { Document } from './Document'
import { ItemData } from './items/Item'
import { UndoStack, UndoCommand } from '../../util/UndoStack'
import { itemFromData } from './items/ItemPack'

export class Commit implements UndoCommand {
  constructor (
    public readonly document: Document, public readonly title: string,
    public readonly additions: ItemData[], public readonly removals: ItemData[], public readonly changes: [ItemData, ItemData][]
  ) {}

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
      }
    }
  }
}

export class VersionControl {
  commitHistory = new UndoStack<Commit>()
  private itemSnapshots = new Map<string, ItemData>()

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

    const commit = new Commit(this.document, title, additions, removals, changes)
    this.commitHistory.push(commit)
  }
}
