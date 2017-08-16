import { Action, addAction } from '../menu'
import { Clipboard } from '../../util/Clipboard'
import { documentManager, packItems } from '../document'
import { clipboardDataType, ClipboardData } from './ClipboardData'

@addAction
export class CopyAction extends Action {
  id = 'edit.copy'
  title = 'Copy'
  enabled = true
  run () {
    const items = packItems([...documentManager.document.selectedItems])
    const data: ClipboardData = {items}
    const clipboard = new Clipboard()
    clipboard.clear()
    clipboard.setData(clipboardDataType, Buffer.from(JSON.stringify(data)))
    clipboard.close()
  }
}
