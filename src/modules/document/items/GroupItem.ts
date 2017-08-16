import { observable, action, IArrayChange, IArraySplice } from 'mobx'
import { Rect } from 'paintvec'
import { Item, ItemData } from './Item'
import { Document } from '../Document'

export interface GroupItemData extends ItemData {
  type: 'group'
  collapsed: boolean
  childIds: string[]
}

export
class GroupItem extends Item {
  readonly children = observable<Item>([])
  @observable collapsed = false

  get position () {
    return this.rect.topLeft
  }

  get size () {
    return this.rect.size
  }

  get rect () {
    return Rect.union(...this.children.map(i => i.rect)) || new Rect()
  }

  constructor (document: Document, id?: string) {
    super(document, id)
    this.children.observe(change => this.onChildChange(change))
  }

  dispose () {
    this.children.forEach(c => c.dispose())
    super.dispose()
  }

  clone ({shallow = true} = {}) {
    const item = new GroupItem(this.document)
    item.loadData(this.toData())
    if (!shallow) {
      item.children.replace(this.children.map(c => c.clone()))
    }
    return item
  }

  loadData (data: GroupItemData) {
    super.loadData(data)
    this.collapsed = data.collapsed
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
      return this.children[i]
    }
  }

  removeChild (item: Item) {
    const index = this.children.indexOf(item)
    if (index >= 0) {
      this.children.splice(index, 1)
    }
  }

  insertBefore (item: Item, reference: Item|undefined) {
    if (reference && !this.children.includes(reference)) {
      throw new Error('reference item is not a child of the group')
    }

    const oldParent = item.parent
    if (oldParent) {
      const oldIndex = oldParent.children.indexOf(item)
      oldParent.children.splice(oldIndex, 1)
    }

    const index = reference ? this.children.indexOf(reference) : this.children.length
    this.children.splice(index, 0, item)
  }

  @action private onChildChange (change: IArrayChange<Item>|IArraySplice<Item>) {
    const onAdded = (child: Item) => {
      child.parent = this
    }
    const onRemoved = (child: Item) => {
      child.parent = undefined
      this.document.selectedItems.delete(child)
      if (this.document.focusedItem === child) {
        this.document.focusedItem = undefined
      }
    }
    if (change.type === 'splice') {
      change.added.forEach(onAdded)
      change.removed.forEach(onRemoved)
    } else {
      onRemoved(change.oldValue)
      onAdded(change.newValue)
    }
  }
}
