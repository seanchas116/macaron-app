import {Command} from './Command'
import {Item} from '../items/Item'
import {GroupItem} from '../items/GroupItem'

export class ItemRemoveCommand extends Command {
  title = 'Remove Item'
  originalParent: GroupItem
  originalBeforeAnchor: Item|undefined

  constructor (public item: Item) {
    super()
  }

  redo () {
    const {parent} = this.item
    if (!parent) {
      throw new Error('item is root and cannot be removed')
    }
    this.originalParent = parent
    this.originalBeforeAnchor = parent.childAt(parent.children.indexOf(this.item) + 1)
    parent.removeChild(this.item)
  }

  undo () {
    this.originalParent.insertBefore(this.item, this.originalBeforeAnchor)
  }
}
