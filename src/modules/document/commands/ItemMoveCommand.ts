import {Command} from './Command'
import {Item} from '../items/Item'
import {GroupItem} from '../items/GroupItem'

export class ItemMoveCommand extends Command {
  title = 'Move Item'
  originalParent: GroupItem
  originalBeforeReference: Item|undefined

  constructor (public parent: GroupItem, public item: Item, public beforeReference: Item|undefined) {
    super()
  }

  redo () {
    const origParent = this.item.parent
    if (!origParent) {
      throw new Error('item is root and cannot be moved')
    }
    this.originalParent = origParent
    this.originalBeforeReference = origParent.childAt(origParent.children.indexOf(this.item) + 1)
    origParent.removeChild(this.item)
    this.parent.insertBefore(this.item, this.beforeReference)
  }

  undo () {
    this.parent.removeChild(this.item)
    this.originalParent.insertBefore(this.item, this.originalBeforeReference)
  }
}
