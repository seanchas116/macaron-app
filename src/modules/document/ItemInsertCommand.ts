import {Command} from './Command'
import {Item} from '../document/Item'
import {GroupItem} from '../document/GroupItem'

export class ItemInsertCommand extends Command {
  title = 'Insert Item'
  originalBeforeAnchor: Item|undefined

  constructor (public parent: GroupItem, public item: Item, public beforeReference: Item|undefined) {
    super()
  }

  redo () {
    this.parent.insertBefore(this.item, this.beforeReference)
  }

  undo () {
    this.parent.removeChild(this.item)
  }
}
