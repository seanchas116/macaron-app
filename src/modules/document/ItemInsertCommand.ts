import {Command} from './Command'
import {Item} from '../document/Item'
import {GroupItem} from '../document/GroupItem'

export class ItemInsertCommand extends Command {
  originalBeforeAnchor: Item|undefined

  constructor (public title: string, public parent: GroupItem, public item: Item, public beforeAnchor: Item|undefined) {
    super()
  }

  redo () {
    this.parent.insertBefore(this.item, this.beforeAnchor)
  }

  undo () {
    this.parent.removeChild(this.item)
  }
}
