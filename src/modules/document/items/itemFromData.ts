import {ItemData} from './Item'
import {RectItem, RectItemData} from './RectItem'
import {OvalItem, OvalItemData} from './OvalItem'
import {TextItem, TextItemData} from './TextItem'
import {GroupItem, GroupItemData} from './GroupItem'
import {Document} from '../Document'

export function itemFromData (document: Document, data: ItemData, {assignNewID = true} = {}) {
  const id = assignNewID ? data.id : undefined
  switch (data.type) {
    case 'rect': {
      const item = new RectItem(document, id)
      item.loadData(data as RectItemData)
      return item
    }
    case 'oval': {
      const item = new OvalItem(document, id)
      item.loadData(data as OvalItemData)
      return item
    }
    case 'text': {
      const item = new TextItem(document, id)
      item.loadData(data as TextItemData)
      return item
    }
    case 'group': {
      const item = new GroupItem(document, id)
      item.loadData(data as GroupItemData)
      return item
    }
    default:
      throw new Error('Cannot load item')
  }
}
