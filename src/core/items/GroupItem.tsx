import * as React from 'react'
import {observable, action, IArrayChange, IArraySplice} from 'mobx'
import {Rect} from 'paintvec'
import {Item, ItemProps} from './Item'
import {Document} from '../Document'

export interface GroupItemProps extends ItemProps {
  type: 'group'
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

  constructor (document: Document, props: GroupItemProps) {
    super(document, props)
    this.collapsed = props.collapsed
    this.children.observe(change => this.onChildChange(change))
  }

  render () {
    return <g key={this.id}>
      {[...this.children].reverse().map(c => c.render())}
    </g>
  }

  clone () {
    const item = new GroupItem(this.document, this.toProps())
    const children = this.children.map(c => c.clone())
    item.children.replace(children)
    return item
  }

  toProps (): GroupItemProps {
    const {collapsed} = this
    return {
      ...super.toProps(),
      type: 'group',
      collapsed
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
