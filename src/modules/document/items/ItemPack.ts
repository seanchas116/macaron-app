import { Item, ItemData } from './Item'
import { RectItem } from './RectItem'
import { OvalItem } from './OvalItem'
import { TextItem } from './TextItem'
import { PathItem } from './PathItem'
import { GroupItem, GroupItemData } from './GroupItem'
import { Document } from '../Document'

export function createItem (type: string, document: Document, id?: string): Item {
  switch (type) {
    case 'rect':
      return new RectItem(document, id)
    case 'oval':
      return new OvalItem(document, id)
    case 'text':
      return new TextItem(document, id)
    case 'path':
      return new PathItem(document, id)
    case 'group':
      return new GroupItem(document, id)
    default:
      throw new Error('Cannot load item')
  }
}

export function packItems (items: Item[]): ItemData[] {
  const datas: ItemData[] = []
  for (const item of items) {
    const data = item.toData()
    datas.push(data)
    if (item instanceof GroupItem) {
      datas.push(...packItems(item.children))
    }
  }
  return datas
}

export function unpackItems (document: Document, datas: ItemData[], opts: {newID: boolean}) {
  const itemForId = new Map<string, Item>()
  for (const data of datas) {
    const item = createItem(data.type, document, opts.newID ? undefined : data.id)
    item.loadData(data)
  }
  for (const data of datas) {
    if (data.type === 'group') {
      const group = itemForId.get(data.id)
      if (!(group instanceof GroupItem)) {
        throw new Error('Cannot find created group item')
      }
      for (const childId of (data as GroupItemData).childIds) {
        const child = itemForId.get(childId)
        if (!child) {
          throw new Error(`Child ${childId} is not included in data`)
        }
        group.children.push(child)
      }
    }
  }
  const rootItems: Item[] = []
  for (const item of itemForId.values()) {
    if (!item.parent) {
      rootItems.push(item)
    }
  }
  return rootItems
}
