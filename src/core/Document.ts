import {observable, action} from 'mobx'
import {Vec2} from 'paintvec'
import {Item} from './items/Item'
import {GroupItem} from './items/GroupItem'

export
class Document {
  @observable rootItem = new GroupItem(this, {
    type: 'group',
    name: 'root',
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 1,
    collapsed: false
  })
  @observable selectedItems = new Set<Item>()
  @observable scroll = new Vec2()

  selectItem (item: Item, add: boolean) {
    if (add) {
      this.selectedItems = new Set(this.selectedItems).add(item)
    } else if (!this.selectedItems.has(item)) {
      this.selectedItems = new Set([item])
    }
  }

  deselectItems () {
    this.selectedItems = new Set()
  }

  @action deleteItems () {
    for (const item of this.selectedItems) {
      const {parent} = item
      if (parent) {
        parent.children.remove(item)
      }
    }
  }
}
