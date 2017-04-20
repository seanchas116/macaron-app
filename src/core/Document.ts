import {observable} from 'mobx'
import {Item} from './items/Item'
import {GroupItem} from './items/GroupItem'

export
class Document {
  readonly rootItem = new GroupItem(this)
  readonly selectedItems = observable<Item>([])
}
