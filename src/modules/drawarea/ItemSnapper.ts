import { Rect } from 'paintvec'
import { Snapper } from './Snapper'
import { Item, FrameItem } from '../document'

export class ItemSnapper extends Snapper {
  setTargetItems (items: ReadonlyArray<Item>) {
    this.clear()
    const snapTargets: Rect[] = []
    for (const item of items) {
      if (item.parent && item.parent instanceof FrameItem) {
        snapTargets.push(item.parent.globalRect)
      }
      for (const sibling of item.siblings) {
        if (!items.includes(sibling)) {
          snapTargets.push(sibling.globalRect)
        }
      }
    }
    this.targets = snapTargets
  }
}

export const itemSnapper = new ItemSnapper()
