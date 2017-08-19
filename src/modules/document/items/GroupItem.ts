import { observable } from 'mobx'
import { Rect } from 'paintvec'
import { Item, ItemData, undoable } from './Item'
import { Document } from '../Document'

export interface GroupItemData extends ItemData {
  type: 'group'
  collapsed: boolean
  childIds: string[]
}

export
class GroupItem extends Item {
  @observable collapsed = false
  @undoable private readonly _children = observable<Item>([])

  get position () {
    return this.rect.topLeft
  }

  get size () {
    return this.rect.size
  }

  get rect () {
    return Rect.union(...this._children.map(i => i.rect)) || new Rect()
  }

  get children (): ReadonlyArray<Item> {
    return this._children.peek()
  }

  constructor (document: Document, id?: string) {
    super(document, id)
  }

  clone ({shallow = true} = {}) {
    const item = new GroupItem(this.document)
    item.loadData(this.toData())
    if (!shallow) {
      item.appendChild(...this.children.map(c => c.clone()))
    }
    return item
  }

  loadData (data: GroupItemData) {
    super.loadData(data)
    this.collapsed = data.collapsed
  }

  loadChildren (childIds: string[]) {
    this.clearChildren()
    for (const childId of childIds) {
      const item = this.document.itemForId.get(childId)
      if (!item) {
        throw new Error(`Child ${childId} is not found`)
      }
      this.appendChild(item)
    }
  }

  toData (): GroupItemData {
    const {collapsed} = this
    const childIds = this.children.map(c => c.id)
    return {
      ...super.toData(),
      type: 'group',
      collapsed,
      childIds
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
    if (reference && !this.children.includes(reference)) {
      throw new Error('reference item is not a child of the group')
    }

    const oldParent = item.parent
    if (oldParent) {
      oldParent.removeChild(item)
    }

    const index = reference ? this.children.indexOf(reference) : this.children.length
    this._children.splice(index, 0, item)
    item.parent = this
  }

  appendChild (...items: Item[]) {
    for (const item of items) {
      this.insertBefore(item, undefined)
    }
  }
}
