import { remote } from 'electron'
import { observable, autorun } from 'mobx'
import { Document } from './Document'

export class DocumentManager {
  @observable document = new Document()

  constructor () {
    autorun(() => {
      const win = remote.getCurrentWindow()
      win.setRepresentedFilename(this.document.filePath)
      win.setTitle(this.document.fileName)
    })
  }
}

export const documentManager = new DocumentManager()
