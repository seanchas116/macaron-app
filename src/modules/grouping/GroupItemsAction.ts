import {computed, action} from 'mobx'
import {Action} from '../menu/Action'
import {addAction} from '../menu/ActionManager'
import {documentManager} from '../document/DocumentManager'
import {GroupItem} from '../document/GroupItem'

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
    const group = new GroupItem(document, {
      type: 'group',
      name: 'Group',
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 1,
      collapsed: false
    })
    const parent = items[0].parent
    if (!parent) {
      return
    }
    const index = parent.children.indexOf(items[0])

    for (const item of items) {
      const {parent} = item
      if (parent) {
        const index = parent.children.indexOf(item)
        parent.children.splice(index, 1)
      }
    }
    group.children.replace(items)

    parent.children.splice(index, 0, group)
    document.selectedItems.replace([group])
  }
}
