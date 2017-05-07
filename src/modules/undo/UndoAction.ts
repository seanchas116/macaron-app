import {computed} from 'mobx'
import {Action} from '../menu/Action'
import {addAction} from '../menu/ActionManager'
import {documentManager} from '../document'

@addAction
export class UndoAction extends Action {
  id = 'edit.undo'

  @computed get title () {
    const {commandToUndo} = documentManager.document.history
    return commandToUndo ? `Undo ${commandToUndo.title}` : 'Undo'
  }

  @computed get enabled () {
    return documentManager.document.history.canUndo
  }

  run () {
    documentManager.document.history.undo()
  }
}
