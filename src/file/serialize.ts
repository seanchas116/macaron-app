import {Document} from '../core/Document'
import {createItem} from '../core/items/createItem'
import {Item, ItemProps} from '../core/items/Item'
import {GroupItem} from '../core/items/GroupItem'

export interface DocumentData {
  version: number
  selectedItemIds: string[]
  scrollX: number
  scrollY: number
  pages: {name: string, path: string}[]
}

export interface ItemData extends ItemProps {
  id: string
  children?: ItemData[]
}

export function itemToData (item: Item): ItemData {
  const props = item.toProps()
  const {id} = item
  if (item instanceof GroupItem) {
    return {...props, id, children: item.children.map(itemToData)}
  } else {
    return {...props, id}
  }
}

export function dataToItem (document: Document, data: ItemData): Item {
  const item = createItem(document, data, data.id)
  if (item instanceof GroupItem) {
    const children = (data.children || []).map(data => dataToItem(document, data))
    item.children.replace(children)
  }
  return item
}
