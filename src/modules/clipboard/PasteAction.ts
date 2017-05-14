import {Action, addAction} from '../menu'
import {itemFromData, documentManager, CompositeCommand, ItemInsertCommand} from '../document'
import {clipboardDataType, ClipboardData} from './ClipboardData'
import {getClipboardData} from '../../native'

@addAction
export class PasteAction extends Action {
  id = 'edit.paste'
  title = 'Paste'
  enabled = true
  run () {
    const {document} = documentManager
    const buffer: Buffer|undefined = getClipboardData(clipboardDataType)
    if (!buffer) {
      return
    }
    const data: ClipboardData = JSON.parse(buffer.toString())
    if (data.items) {
      const items = data.items.map(data => itemFromData(document, data))
      const selectedItems = [...document.selectedItems]
      const nextItem = selectedItems.length > 0 ? selectedItems[0] : document.rootItem.childAt(0)
      const parent = nextItem ? nextItem.parent : document.rootItem
      if (!parent) {
        return
      }
      const commands = items.map(item => new ItemInsertCommand('Paste Item', parent, item, nextItem))
      document.history.push(new CompositeCommand('Paste Items', commands))
      document.selectedItems.replace(items)
    }
  }
}
