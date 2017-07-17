import { remote, ipcRenderer } from 'electron'
import { Action, addAction } from '../../menu'
const {dialog} = remote

@addAction
export class FileOpenAction extends Action {
  id = 'file.open'
  title = 'Open...'
  enabled = true
  async run () {
    const filePaths = await new Promise<string[]|undefined>((resolve, reject) => {
      dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: 'Open',
        filters: [{
          name: 'Macaron Document',
          extensions: ['macaron']
        }]
      }, resolve)
    })
    if (!filePaths || filePaths.length === 0) {
      return
    }
    ipcRenderer.send('newWindow', filePaths[0])
  }
}
