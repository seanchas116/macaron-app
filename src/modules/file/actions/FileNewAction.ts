import { Action, addAction } from '../../menu'
import { ipcRenderer } from 'electron'

@addAction
export class FileNewAction extends Action {
  id = 'file.new'
  title = 'New'
  enabled = true
  run () {
    ipcRenderer.send('newWindow')
  }
}
