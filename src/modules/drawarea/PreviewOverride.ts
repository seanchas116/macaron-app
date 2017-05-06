import {Item, ItemProps} from '../document/Item'
import {ObservableMap} from '../../util/ObservableMap'

export class PreviewOverride {
  readonly overrides = new ObservableMap<Item, Partial<ItemProps>>()

  proxy (item: Item) {
    if (this.overrides.has(item)) {
      return new Proxy<Item>(item, proxyHandler)
    } else {
      return item
    }
  }
}

export const previewOverride = new PreviewOverride()

const proxyHandler = {
  get: (target: Item, name: string) => {
    if (name in previewOverride.overrides) {
      return previewOverride.overrides[name]
    }
    return target[name]
  }
}
