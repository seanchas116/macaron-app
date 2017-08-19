import { computed } from 'mobx'
import { Action, addAction } from '../menu'
import { documentManager } from '../document'

@addAction
export class UndoAction extends Action {
  id = 'edit.undo'

  @computed get title () {
    const {commandToUndo} = documentManager.document.versionControl.commitHistory
    return commandToUndo ? `Undo ${commandToUndo.title}` : 'Undo'
  }

  @computed get enabled () {
    return documentManager.document.versionControl.commitHistory.canUndo
  }

  run () {
    documentManager.document.versionControl.commitHistory.undo()
  }
}
