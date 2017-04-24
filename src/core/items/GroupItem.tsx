import * as React from 'react'
import {observable, action, IArrayChange, IArraySplice} from 'mobx'
import {Rect} from 'paintvec'
import {Item} from './Item'
import {Document} from '../Document'

export
class GroupItem extends Item {
  readonly children = observable<Item>([])
  @observable collapsed = false
  name = 'Group'

  get position () {
    return this.rect.topLeft
  }

  get size () {
    return this.rect.size
  }

  get rect () {
    return Rect.union(...this.children.map(i => i.rect)) || new Rect()
  }

  constructor (document: Document) {
    super(document)
    this.children.observe(change => this.onChildChange(change))
  }

  render () {
    return <g key={this.id}>
      {[...this.children].reverse().map(c => c.render())}
    </g>
  }

  clone () {
    const cloned = new GroupItem(this.document)
    cloned.copyPropsFrom(this)
    cloned.children.replace(this.children.map(c => c.clone()))
    return cloned
  }

  copyPropsFrom (other: GroupItem) {
    super.copyPropsFrom(other)
    this.collapsed = other.collapsed
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
