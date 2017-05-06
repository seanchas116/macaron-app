import * as path from 'path'
import {observable, action, computed} from 'mobx'
import {Vec2} from 'paintvec'
import {Item} from './Item'
import {GroupItem} from './GroupItem'
import {History} from './History'

export
class Document {
  itemForId = new Map<string, Item>()

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

  @observable filePath = ''
  @observable tempName = 'Untitled'

  readonly history = new History()

  @computed get fileName() {
    if (this.filePath) {
      return path.basename(this.filePath)
    } else {
      return this.tempName
    }
  }

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
