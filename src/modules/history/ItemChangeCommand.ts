import {Command} from './Command'
import {Item, ItemProps} from '../document/Item'

export class ItemChangeCommand extends Command {
  oldProps: Partial<ItemProps> = {}

  constructor (public title: string, public item: Item, public props: Partial<ItemProps>) {
    super()
  }

  redo () {
    this.oldProps = {}
    for (const key in this.props) {
      this.oldProps[key] = this.item[key]
    }
    Object.assign(this.item, this.props)
  }

  undo () {
    Object.assign(this.item, this.oldProps)
  }
}
