import {computed, action} from 'mobx'
import {Action} from '../menu/Action'
import {addAction} from '../menu/ActionManager'
import {documentManager, CompositeCommand, ItemInsertCommand, ItemMoveCommand, GroupItem} from '../document'

@addAction
export class GroupItemsAction extends Action {
  id = 'item.group'
  title = 'Group'

  @computed get enabled () {
    return documentManager.document.selectedItems.size > 0
  }

  @action run () {
    const {document} = documentManager
    const items = [...document.selectedItems]
    if (items.length === 0) {
      return
    }
    const parent = items[0].parent
    if (!parent) {
      return
    }

    const group = new GroupItem(document, {
      type: 'group',
      name: 'Group',
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 1,
      collapsed: false
    })
    const commands = [
      new ItemInsertCommand('Add Group', parent, group, items[0]),
      ...items.map(item => new ItemMoveCommand(group, item, undefined))
    ]
    document.history.push(new CompositeCommand('Group Item', commands))
    document.selectedItems.replace([group])
  }
}
