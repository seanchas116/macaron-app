import { computed, action } from 'mobx'
import { Action, addAction } from '../menu'
import { documentManager, Command, CompositeCommand, ItemRemoveCommand, ItemMoveCommand, Item, GroupItem } from '../document'

@addAction
export class UngroupItemsAction extends Action {
  id = 'item.ungroup'
  title = 'Ungroup'

  @computed get enabled () {
    return documentManager.document.selectedItems.size > 0
  }

  @action run () {
    const {document} = documentManager
    const items = [...document.selectedItems]
    const newSelectedItems: Item[] = []
    if (items.length === 0) {
      return
    }
    const commands: Command[] = []
    for (const item of items) {
      if (!(item instanceof GroupItem)) {
        continue
      }
      const {parent} = item
      if (!parent) {
        continue
      }
      commands.push(...item.children.map(child => new ItemMoveCommand(parent, child, item)))
      commands.push(new ItemRemoveCommand(item))
    }
    document.history.push(new CompositeCommand('Ungroup Items', commands))
    document.selectedItems.replace(newSelectedItems)
  }
}
