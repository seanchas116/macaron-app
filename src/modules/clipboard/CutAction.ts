import { Action, addAction } from '../menu'
import { CopyAction } from './CopyAction'
import { ItemRemoveCommand, CompositeCommand, documentManager } from '../document'

@addAction
export class CutAction extends Action {
  id = 'edit.cut'
  title = 'Cut'
  enabled = true
  run () {
    new CopyAction().run()
    const {document} = documentManager
    const commands = [...document.selectedItems].map(item => new ItemRemoveCommand(item))
    document.history.push(new CompositeCommand('Cut Items', commands))
  }
}
