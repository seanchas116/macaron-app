import {observable, action, IArrayChange, IArraySplice} from 'mobx'
import {Rect} from 'paintvec'
import {Item, ItemData} from './Item'
import {Document} from '../Document'
import {itemFromData} from './itemFromData'

export interface GroupItemData extends ItemData {
  type: 'group'
  collapsed: boolean
  children: ItemData[]
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

  clone ({deep = true} = {}) {
    const item = new GroupItem(this.document)
    item.loadData(this.toData(), {deep, assignNewID: true})
    return item
  }

  loadData (data: GroupItemData, {deep = true, assignNewID = true} = {}) {
    super.loadData(data)
    this.collapsed = data.collapsed
    if (deep) {
      this.children.replace(data.children.map(c => itemFromData(this.document, c, assignNewID)))
    }
  }

  toData (): GroupItemData {
    const {collapsed} = this
    const children = this.children.map(c => c.toData())
    return {
      ...super.toData(),
      type: 'group',
      collapsed,
      children
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
