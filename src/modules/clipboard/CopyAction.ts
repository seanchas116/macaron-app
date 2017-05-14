import {Action, addAction} from '../menu'
import {setClipboardData, clearClipboard} from '../../native'
import {documentManager} from '../document'
import {clipboardDataType, ClipboardData} from './ClipboardData'

@addAction
export class CopyAction extends Action {
  id = 'edit.copy'
  title = 'Copy'
  enabled = true
  run () {
    clearClipboard()
    const items = [...documentManager.document.selectedItems].map(item => item.toData())
    const data: ClipboardData = {items}
    setClipboardData(clipboardDataType, Buffer.from(JSON.stringify(data)))
  }
}
