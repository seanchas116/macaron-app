import {Action} from '../core/Action'
import {addAction} from '../core/ActionManager'

@addAction
export class FileSaveAction extends Action {
  id = 'file.save'
  title = 'Save'
  enabled = true
  run () {
    // TODO
  }
}
