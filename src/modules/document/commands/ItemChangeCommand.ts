import { Command } from './Command'
import { Item } from '../items/Item'

export class ItemChangeCommand<T extends Item> extends Command {
  oldProps: Partial<T> = {}

  constructor (public title: string, public item: T, public props: Partial<T>) {
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
