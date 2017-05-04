import {Action} from '../core/Action'
import {addAction} from '../core/ActionManager'

@addAction
export class FileSaveAsAction extends Action {
  id = 'file.saveAs'
  title = 'Save As...'
  enabled = true
  run () {
    // TODO
  }
}
