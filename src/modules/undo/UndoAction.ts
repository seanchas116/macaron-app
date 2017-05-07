import {computed} from 'mobx'
import {Action} from '../menu/Action'
import {addAction} from '../menu/ActionManager'
import {documentManager} from '../document/DocumentManager'

@addAction
export class UndoAction extends Action {
  id = 'edit.undo'
  title = 'Undo'

  @computed get enabled () {
    return documentManager.document.history.canUndo
  }

  run () {
    documentManager.document.history.undo()
  }
}
