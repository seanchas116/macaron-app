import {Action} from '../../core/Action'
import {addAction} from '../../core/ActionManager'
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
