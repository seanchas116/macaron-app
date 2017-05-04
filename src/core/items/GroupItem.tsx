import * as React from 'react'
import {observable, action, IArrayChange, IArraySplice} from 'mobx'
import {Rect} from 'paintvec'
import {Item, ItemData} from './Item'
import {Document} from '../Document'
import {createItem} from './createItem'

export interface GroupItemData extends ItemData {
  type: 'group'
  children: ItemData[]
  collapsed: boolean
}

export
class GroupItem extends Item {
  readonly children = observable<Item>([])
  @observable collapsed: boolean

  get position () {
    return this.rect.topLeft
  }

  get size () {
    return this.rect.size
  }

  get rect () {
    return Rect.union(...this.children.map(i => i.rect)) || new Rect()
  }

  constructor (document: Document, data: GroupItemData) {
    super(document, data)
    this.collapsed = data.collapsed
    this.children.replace(data.children.map(c => createItem(document, c)))
    this.children.observe(change => this.onChildChange(change))
  }

  render () {
    return <g key={this.id}>
      {[...this.children].reverse().map(c => c.render())}
    </g>
  }

  clone () {
    return new GroupItem(this.document, this.toData())
  }

  toData (): GroupItemData {
    const {collapsed} = this
    const children = this.children.peek().map(c => c.toData())
    return {
      ...super.toData(),
      type: 'group',
      collapsed,
      children
    }
  }

  @action private onChildChange (change: IArrayChange<Item>|IArraySplice<Item>) {
    const onAdded = (child: Item) => {
      child.parent = this
    }
    const onRemoved = (child: Item) => {
      child.parent = undefined
      const selectedItems = new Set(this.document.selectedItems)
      selectedItems.delete(child)
      this.document.selectedItems = selectedItems
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
