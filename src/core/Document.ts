import {observable} from 'mobx'
import {Item} from './items/Item'
import {GroupItem} from './items/GroupItem'

export
class Document {
  readonly rootItem = new GroupItem(this)
  @observable selectedItems = new Set<Item>()

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
}
