import {observable} from 'mobx'
import {Item} from './items/Item'

export
class Document {
  readonly items = observable<Item>([])
  readonly selectedItems = observable<Item>([])
}
