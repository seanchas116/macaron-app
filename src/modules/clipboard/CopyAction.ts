import {Action, addAction} from '../menu'
import {Clipboard} from '../../native'
import {documentManager} from '../document'
import {clipboardDataType, ClipboardData} from './ClipboardData'

@addAction
export class CopyAction extends Action {
  id = 'edit.copy'
  title = 'Copy'
  enabled = true
  run () {
    const clipboard = new Clipboard()
    clipboard.clear()
    const items = [...documentManager.document.selectedItems].map(item => item.toData())
    const data: ClipboardData = {items}
    clipboard.setData(clipboardDataType, Buffer.from(JSON.stringify(data)))
  }
}
