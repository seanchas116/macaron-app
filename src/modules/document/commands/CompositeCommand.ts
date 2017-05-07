import {Command} from './Command'

export class CompositeCommand extends Command {
  constructor (public readonly title: string, public readonly commands: Command[]) {
    super()
  }

  redo () {
    this.commands.forEach(c => c.redo())
  }

  undo () {
    [...this.commands].reverse().forEach(c => c.undo())
  }
}
