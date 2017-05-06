import {ObservableMap} from '../../util/ObservableMap'
import {Item} from '../document/Item'

export class ItemPreview {
  readonly items = new ObservableMap<Item, Item>()

  add (item: Item) {
    const oldPreview = this.items.get(item)
    if (oldPreview) {
      oldPreview.dispose()
    }
    const preview = item.clone({shallow: true})
    this.items.set(item, preview)
    return preview
  }

  get (item: Item) {
    return this.items.get(item)
  }

  clear () {
    for (const preview of this.items.values()) {
      preview.dispose()
    }
    this.items.clear()
  }
}

export const itemPreview = new ItemPreview()
