import {Action, addAction} from '../menu'

@addAction
export class CopyAction extends Action {
  id = 'edit.copy'
  title = 'Copy'
  enabled = true
  run () {
    // TODO
  }
}
