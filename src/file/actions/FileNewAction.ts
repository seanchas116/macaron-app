import {Action} from '../../core/Action'
import {addAction} from '../../core/ActionManager'

@addAction
export class FileNewAction extends Action {
  id = 'file.new'
  title = 'New'
  enabled = true
  run () {
    // TODO
  }
}
