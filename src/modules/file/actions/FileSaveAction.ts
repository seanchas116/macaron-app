import { Action, addAction } from '../../menu'
import { documentManager } from '../../document'
import { FileSaveAsAction } from './FileSaveAsAction'
import { save } from '../save'

@addAction
export class FileSaveAction extends Action {
  id = 'file.save'
  title = 'Save'
  enabled = true

  async run () {
    const {document} = documentManager
    if (document.filePath) {
      await save(document, document.filePath)
    } else {
      new FileSaveAsAction().run()
    }
  }
}
