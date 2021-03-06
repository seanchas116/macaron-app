import { Item, ItemData } from './Item'
import { RectItem } from './RectItem'
import { OvalItem } from './OvalItem'
import { TextItem } from './TextItem'
import { PathItem } from './PathItem'
import { GroupItem } from './GroupItem'
import { FrameItem } from './FrameItem'
import { Document } from '../Document'

export function createItem (document: Document, type: string, id?: string): Item {
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
    case 'frame':
      return new FrameItem(document, id)
    default:
      throw new Error('Cannot load item')
  }
}

export function itemFromData (document: Document, data: ItemData, id?: string) {
  const item = createItem(document, data.type, id)
  item.loadData(data)
  return item
}

export function packItems (items: ReadonlyArray<Item>): ItemData[] {
  const datas: ItemData[] = []
  for (const item of items) {
    const data = item.toData()
    datas.push(...packItems(item.children))
    datas.push(data)
  }
  return datas
}

export function unpackItems (document: Document, datas: ReadonlyArray<ItemData>, opts: {newID: boolean}) {
  const itemForDataId = new Map<string, Item>()
  for (const data of datas) {
    const item = itemFromData(document, data, opts.newID ? undefined : data.id)
    itemForDataId.set(data.id, item)
  }
  for (const data of datas) {
    const item = itemForDataId.get(data.id)
    if (item) {
      item.loadChildren(data.childIds)
    }
  }
  const rootItems: Item[] = []
  for (const item of itemForDataId.values()) {
    if (!item.parent) {
      rootItems.push(item)
    }
  }
  return rootItems
}

export function cloneItems (items: ReadonlyArray<Item>) {
  const data = packItems(items)
  return unpackItems(items[0].document, data, {newID: true})
}
