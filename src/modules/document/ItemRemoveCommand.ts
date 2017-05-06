import {Command} from './Command'
import {Item} from '../document/Item'
import {GroupItem} from '../document/GroupItem'

export class ItemRemoveCommand extends Command {
  title = 'Remove Item'
  originalBeforeAnchor: Item|undefined

  constructor (public parent: GroupItem, public item: Item) {
    super()
  }

  redo () {
    const origParent = this.item.parent
    if (!origParent) {
      throw new Error('item is root and cannot be removed')
    }
    this.originalBeforeAnchor = origParent.childAt(origParent.children.indexOf(this.item) + 1)
    this.parent.removeChild(this.item)
  }

  undo () {
    this.parent.insertBefore(this.item, this.originalBeforeAnchor)
  }
}
