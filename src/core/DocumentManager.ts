import {observable} from 'mobx'
import {Document} from './Document'

export class DocumentManager {
  @observable document = new Document()
}

export const documentManager = new DocumentManager()
