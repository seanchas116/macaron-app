import {remote} from 'electron'
import {Action, addAction} from '../../menu'
import {documentManager} from '../../document'
import {save} from '../save'
const {dialog} = remote

@addAction
export class FileSaveAsAction extends Action {
  id = 'file.saveAs'
  title = 'Save As...'
  enabled = true

  async run () {
    const filePath = await new Promise<string|undefined>((resolve, reject) => {
      dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: 'Save As...',
        filters: [{
          name: 'Macaron Document',
          extensions: ['macaron']
        }]
      }, resolve)
    })

    if (!filePath) {
      return false
    }

    try {
      await save(documentManager.document, filePath)
      return true
    } catch (e) {
      console.error(e)
      dialog.showErrorBox('Error', 'Failed to save file.')
      return false
    }
  }
}
