import * as React from 'react'
import {observable, action, IArrayChange, IArraySplice} from 'mobx'
import {Item} from './Item'
import {Document} from '../Document'

export
class GroupItem extends Item {
  readonly children = observable<Item>([])
  @observable collapsed = false
  name = 'Group'

  constructor (document: Document) {
    super(document)
    this.children.observe(change => this.onChildChange(change))
  }

  render () {
    return <g>
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
      const selected = this.document.selectedItems
      for (let i = selected.length - 1; i >= 0; --i) {
        if (selected[i] === child) {
          selected.splice(i, 1)
        }
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
