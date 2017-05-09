import {Action, addAction} from '../menu'
import {itemFromData, documentManager, CompositeCommand, ItemInsertCommand} from '../document'
import {clipboardDataType, ClipboardData} from './ClipboardData'
import {Clipboard} from '../native'

@addAction
export class PasteAction extends Action {
  id = 'edit.paste'
  title = 'Paste'
  enabled = true
  run () {
    const {document} = documentManager
    const data: ClipboardData|undefined = new Clipboard().getData(clipboardDataType)
    if (!data) {
      return
    }
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
    }
  }
}
