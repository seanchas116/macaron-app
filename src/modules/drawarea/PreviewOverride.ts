import {observable} from 'mobx'
import {Item, ItemProps} from '../document/Item'

export class PreviewOverride {
  @observable item: Item|undefined
  @observable overrides: Partial<ItemProps> = {}

  proxy (item: Item) {
    if (item === this.item) {
      return new Proxy<Item>(item, proxyHandler)
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
