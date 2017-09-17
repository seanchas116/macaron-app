import { computed, action } from 'mobx'
import { Action, addAction } from '../menu'
import { documentManager, Item } from '../document'

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
      if (item.children.length === 0) {
        continue
      }
      const {parent} = item
      if (!parent) {
        continue
      }
      for (const child of [...item.children]) {
        parent.insertBefore(child, item)
      }
      parent.removeChild(item)
    }
    document.versionControl.commit('Ungroup Items')
    document.selectedItems.replace(newSelectedItems)
  }
}
