import {Action, addAction} from '../menu'

@addAction
export class PasteAction extends Action {
  id = 'edit.paste'
  title = 'Paste'
  enabled = true
  run () {
    // TODO
  }
}
