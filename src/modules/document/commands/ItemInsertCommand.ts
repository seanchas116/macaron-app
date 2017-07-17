import { Command } from './Command'
import { Item } from '../items/Item'
import { GroupItem } from '../items/GroupItem'

export class ItemInsertCommand extends Command {
  originalBeforeAnchor: Item|undefined

  constructor (public title: string, public parent: GroupItem, public item: Item, public beforeReference: Item|undefined) {
    super()
  }

  redo () {
    this.parent.insertBefore(this.item, this.beforeReference)
  }

  undo () {
    this.parent.removeChild(this.item)
  }
}
