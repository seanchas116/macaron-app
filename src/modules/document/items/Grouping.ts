import { observable, IObservableArray } from 'mobx'
import { Item, ItemComponent, GroupLikeItem, undoableArray } from './Item'

export interface GroupingData {
  collapsed: boolean
  childIds: string[]
}

export class Grouping extends ItemComponent {
  @observable collapsed = false
  private readonly _children: IObservableArray<Item> = undoableArray<Item>(this, [])

  constructor (public item: GroupLikeItem) {
    super(item)
  }

  get children (): ReadonlyArray<Item> {
    return this._children.peek()
  }

  get canHaveChildren () {
    return false
  }

  loadData (data: GroupingData) {
    // load children later
    this.collapsed = data.collapsed
  }

  toData (): GroupingData {
    return {
      collapsed: this.collapsed,
      childIds: this.children.map(c => c.id)
    }
  }

  loadChildren (childIds: string[]) {
    this.clearChildren()
    for (const childId of childIds) {
      const item = this.item.document.itemForId.get(childId)
      if (!item) {
        throw new Error(`Child ${childId} is not found`)
      }
      this.appendChild(item)
    }
  }

  childAt (i: number) {
    if (0 <= i && i < this.children.length) {
      return this._children[i]
    }
  }

  removeChild (...items: Item[]) {
    for (const item of items) {
      const index = this.children.indexOf(item)
      if (index >= 0) {
        this._children.splice(index, 1)
        item.parent = undefined
      }
    }
  }

  clearChildren () {
    for (const child of this._children) {
      child.parent = undefined
    }
    this._children.clear()
  }

  insertBefore (item: Item, reference: Item|undefined) {
    if (!this.canHaveChildren) {
      throw new Error('this item cannot have children')
    }

    if (reference && !this.children.includes(reference)) {
      throw new Error('reference item is not a child of the group')
    }

    const oldParent = item.parent
    if (oldParent) {
      oldParent.grouping.removeChild(item)
    }

    const index = reference ? this.children.indexOf(reference) : this.children.length
    this._children.splice(index, 0, item)
    item.parent = this.item
  }

  appendChild (...items: Item[]) {
    for (const item of items) {
      this.insertBefore(item, undefined)
    }
  }

  forEachDescendant (action: (item: Item) => void) {
    action(this.item)
    for (const child of this.children) {
      if (child.grouping) {
        child.grouping.forEachDescendant(action)
      } else {
        action(child)
      }
    }
  }

  get allDescendants (): ReadonlyArray<Item> {
    const descendants: Item[] = []
    for (const child of this.children) {
      if (child.grouping) {
        descendants.push(...child.grouping.allDescendants)
      } else {
        descendants.push(child)
      }
    }
    descendants.push(this.item)
    return descendants
  }
}
