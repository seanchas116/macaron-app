import * as path from 'path'
import { observable, action, computed, reaction } from 'mobx'
import { Vec2 } from 'paintvec'
import { Item } from './items/Item'
import { GroupItem } from './items/GroupItem'
import { VersionControl } from './VersionControl'
import { ObservableSet } from '../../util/ObservableSet'

export class Document {
  itemForId = new Map<string, Item>()

  readonly rootItem = new GroupItem(this)
  readonly selectedItems = new ObservableSet<Item>()
  @observable focusedItem: Item|undefined = undefined
  readonly selectedPathNodes = new ObservableSet<number>()
  @observable scroll = new Vec2()

  @observable filePath = ''
  @observable tempName = 'Untitled'

  readonly versionControl = new VersionControl(this)

  @computed get fileName () {
    if (this.filePath) {
      return path.basename(this.filePath)
    } else {
      return this.tempName
    }
  }

  constructor () {
    reaction(() => this.focusedItem, () => {
      this.selectedPathNodes.clear()
    })
  }

  selectItem (item: Item, add: boolean) {
    if (add) {
      this.selectedItems.add(item)
    } else if (!this.selectedItems.has(item)) {
      this.selectedItems.replace([item])
    }
  }

  deselectItems () {
    this.selectedItems.clear()
  }

  @action deleteItems () {
    for (const item of this.selectedItems) {
      const {parent} = item
      if (parent) {
        parent.removeChild(item)
      }
    }
  }

  disposeUnreferencedItems () {
    const referencedItemIds = new Set(this.rootItem.allDescendants.map(item => item.id))
    for (const item of this.itemForId.values()) {
      if (!referencedItemIds.has(item.id)) {
        item.dispose()
      }
    }
  }
}
