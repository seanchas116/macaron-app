import { Action, addAction } from '../menu'
import { CopyAction } from './CopyAction'
import { documentManager } from '../document'

@addAction
export class CutAction extends Action {
  id = 'edit.cut'
  title = 'Cut'
  enabled = true
  run () {
    new CopyAction().run()
    const {document} = documentManager
    for (const item of document.selectedItems) {
      const parent = item.parent
      if (parent) {
        parent.removeChild(item)
      }
    }
    document.versionControl.commit('Cut Item')
  }
}
