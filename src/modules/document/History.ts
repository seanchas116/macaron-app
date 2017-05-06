import {observable, action, computed} from 'mobx'
import {Command} from './Command'

export class History {
  readonly commands = observable<Command>([])
  @observable head = 0

  @computed get canUndo () {
    return 0 < this.head
  }

  @computed get canRedo () {
    return this.head < this.commands.length
  }

  @action push (command: Command) {
    command.redo()
    if (this.canRedo) {
      this.commands.replace(this.commands.slice(0, this.head))
    }
    this.commands.push(command)
    this.head = this.commands.length
  }

  @action undo () {
    if (!this.canUndo) {
      return
    }
    --this.head
    this.commands[this.head].undo()
  }

  @action redo () {
    if (!this.canRedo) {
      return
    }
    this.commands[this.head].redo()
    ++this.head
  }
}
