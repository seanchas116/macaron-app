import {ItemData} from './Item'
import {RectItem, RectItemData} from './RectItem'
import {OvalItem, OvalItemData} from './OvalItem'
import {TextItem, TextItemData} from './TextItem'
import {GroupItem, GroupItemData} from './GroupItem'
import {Document} from '../Document'

export function createItem (document: Document, data: ItemData) {
  switch (data.type) {
    case 'rect':
      return new RectItem(document, data as RectItemData)
    case 'oval':
      return new OvalItem(document, data as OvalItemData)
    case 'text':
      return new TextItem(document, data as TextItemData)
    case 'group':
      return new GroupItem(document, data as GroupItemData)
    default:
      return new RectItem(document, {...data, x: 0, y: 0, width: 0, height: 0})
  }
}
