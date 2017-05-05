import {Action} from '../../menu/Action'
import {addAction} from '../../menu/ActionManager'
import {ipcRenderer} from 'electron'

@addAction
export class FileNewAction extends Action {
  id = 'file.new'
  title = 'New'
  enabled = true
  run () {
    ipcRenderer.send('newWindow')
  }
}
