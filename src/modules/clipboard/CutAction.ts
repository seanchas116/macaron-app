import {Action, addAction} from '../menu'

@addAction
export class CutAction extends Action {
  id = 'edit.cut'
  title = 'Cut'
  enabled = true
  run () {
    // TODO
  }
}
