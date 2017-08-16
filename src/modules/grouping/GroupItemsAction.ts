import { computed, action } from 'mobx'
import { Action, addAction } from '../menu'
import { documentManager, GroupItem } from '../document'

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
    const index = parent.children.indexOf(items[0])

    const group = new GroupItem(document)
    for (const item of items) {
      if (item.parent) {
        item.parent.removeChild(item)
      }
    }
    group.children.replace(items)
    parent.children.splice(index, 0, group)
    document.versionControl.commit('Group Item')
    document.selectedItems.replace([group])
  }
}
