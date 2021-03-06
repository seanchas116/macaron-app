import { Rect } from 'paintvec'
import { Item, ItemData } from './Item'

export interface GroupItemData extends ItemData {
  type: 'group'
}

export
class GroupItem extends Item {
  get position () {
    return this.rect.topLeft
  }

  get size () {
    return this.rect.size
  }

  get rect () {
    return Rect.union(...this.children.map(i => i.rect)) || new Rect()
  }

  get canHaveChildren () {
    return true
  }

  toData (): GroupItemData {
    return {
      ...super.toData(),
      type: 'group'
    }
  }
}
