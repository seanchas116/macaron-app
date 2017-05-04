import {Action} from '../../core/Action'
import {addAction} from '../../core/ActionManager'

@addAction
export class FileOpenAction extends Action {
  id = 'file.open'
  title = 'Open...'
  enabled = true
  run () {
    // TODO
  }
}
