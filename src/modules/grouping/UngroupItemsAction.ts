import {computed, action} from 'mobx'
import {Action} from '../menu/Action'
import {addAction} from '../menu/ActionManager'
import {documentManager} from '../document/DocumentManager'
import {Item} from '../document/Item'
import {GroupItem} from '../document/GroupItem'

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
    for (const item of items) {
      if (!(item instanceof GroupItem)) {
        continue
      }
      const {parent} = item
      if (!parent) {
        continue
      }
      const index = parent.children.indexOf(item)
      const children = item.children.splice(0, item.children.length)
      parent.children.splice(index, 1, ...children)
      newSelectedItems.push(...children)
    }
    document.selectedItems.replace(newSelectedItems)
  }
}
