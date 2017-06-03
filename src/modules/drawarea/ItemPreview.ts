import {ObservableMap} from '../../util/ObservableMap'
import {Item, GroupItem} from '../document'

export class ItemPreview {
  private readonly items = new ObservableMap<Item, Item>()
  private readonly childrens = new ObservableMap<GroupItem, Item[]>()

  addItem (item: Item) {
    const oldPreview = this.items.get(item)
    if (oldPreview) {
      oldPreview.dispose()
    }
    const preview = item.clone({shallow: true})
    this.items.set(item, preview)
    return preview
  }

  getItem<T extends Item> (item: T) {
    return this.items.get(item) as (T | undefined)
  }

  previewItem<T extends Item> (item: T) {
    return this.items.get(item) as T || item
  }

  addChildren (group: GroupItem, children: Item[]) {
    this.childrens.set(group, children)
  }

  getChildren (group: GroupItem) {
    return this.childrens.get(group)
  }

  previewChildren (group: GroupItem) {
    return this.childrens.get(group) || group.children
  }

  clear () {
    for (const preview of this.items.values()) {
      preview.dispose()
    }
    this.items.clear()
    this.childrens.clear()
  }
}

export const itemPreview = new ItemPreview()
