import {ItemProps} from './Item'
import {RectItem, RectItemProps} from './RectItem'
import {OvalItem, OvalItemProps} from './OvalItem'
import {TextItem, TextItemProps} from './TextItem'
import {GroupItem, GroupItemProps} from './GroupItem'
import {Document} from '../Document'

export function createItem (document: Document, props: ItemProps, id?: string) {
  switch (props.type) {
    case 'rect':
      return new RectItem(document, props as RectItemProps, id)
    case 'oval':
      return new OvalItem(document, props as OvalItemProps, id)
    case 'text':
      return new TextItem(document, props as TextItemProps, id)
    case 'group':
      return new GroupItem(document, props as GroupItemProps, id)
    default:
      return new RectItem(document, {...props, type: 'rect', x: 0, y: 0, width: 0, height: 0, radius: 0}, id)
  }
}
