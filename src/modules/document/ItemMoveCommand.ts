import {Command} from './Command'
import {Item} from '../document/Item'
import {GroupItem} from '../document/GroupItem'

export class ItemMoveCommand extends Command {
  title = 'Move Items'
  originalBeforeAnchor: Item|undefined

  constructor (public parent: GroupItem, public item: Item, public beforeAnchor: Item|undefined) {
    super()
  }

  redo () {
    const origParent = this.item.parent
    if (!origParent) {
      throw new Error('item is root and cannot be moved')
    }
    this.originalBeforeAnchor = origParent.children[origParent.children.indexOf(this.item) + 1]
    this.parent.insertBefore(this.item, this.beforeAnchor)
  }

  undo () {
    this.parent.insertBefore(this.item, this.originalBeforeAnchor)
  }
}
