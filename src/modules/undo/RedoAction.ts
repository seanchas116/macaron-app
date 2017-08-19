import { computed } from 'mobx'
import { Action, addAction } from '../menu'
import { documentManager } from '../document'

@addAction
export class UndoAction extends Action {
  id = 'edit.redo'

  @computed get title () {
    const {commandToRedo} = documentManager.document.versionControl.commitHistory
    return commandToRedo ? `Redo ${commandToRedo.title}` : 'Redo'
  }

  @computed get enabled () {
    return documentManager.document.versionControl.commitHistory.canRedo
  }

  run () {
    documentManager.document.versionControl.commitHistory.redo()
  }
}
