import * as path from 'path'
import { observable, computed } from 'mobx'
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

  disposeUnreferencedItems () {
    const referencedItemIds = new Set(this.rootItem.allDescendants().map(item => item.id))
    for (const item of this.itemForId.values()) {
      if (!referencedItemIds.has(item.id)) {
        item.dispose()
      }
    }
  }
}
