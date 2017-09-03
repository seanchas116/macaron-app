import * as React from 'react'
import { TreeView, TreeDelegate, TreeRowInfo } from 'react-draggable-tree'
import { observer } from 'mobx-react'
import * as classNames from 'classnames'

import { Item, GroupItem, documentManager, cloneItems } from '../document'

const styles = require('./ItemHierarchy.css')
require('react-draggable-tree/lib/index.css')

@observer
export class ItemRow extends React.Component<{item: Item, selected: boolean}, {}> {
  render () {
    const {item, selected} = this.props
    const className = classNames(styles.itemRow, {
      [styles.itemRowSelected]: selected
    })
    return <div className={className}>{item.name}</div>
  }
}

class ItemTreeDelegate implements TreeDelegate<Item> {
  getKey (item: Item) {
    return item.id
  }
  getChildren (item: Item) {
    if (item instanceof GroupItem) {
      return item.children as Item[]
    }
  }
  getCollapsed (item: Item) {
    if (item instanceof GroupItem) {
      return item.collapsed
    }
    return false
  }
  renderRow (info: TreeRowInfo<Item>) {
    return <ItemRow item={info.item} selected={info.selected} />
  }
  onSelectedKeysChange (selectedKeys: Set<number>, selectedNodeInfos: TreeRowInfo<Item>[]) {
    documentManager.document.selectedItems.replace(selectedNodeInfos.map(info => info.item))
  }
  onCollapsedChange (info: TreeRowInfo<Item>, collapsed: boolean) {
    const {item} = info
    if (item instanceof GroupItem) {
      item.collapsed = collapsed
    }
  }
  onContextMenu (info: TreeRowInfo<Item>|undefined, ev: React.MouseEvent<HTMLElement>) {
    // TODO
  }
  onMove (src: TreeRowInfo<Item>[], dest: TreeRowInfo<Item>, destIndex: number, destIndexAfter: number) {
    const parent = dest.item
    if (!(parent instanceof GroupItem)) {
      return
    }
    const beforeRef = parent.childAt(destIndex)
    for (const {item} of src) {
      parent.insertBefore(item, beforeRef)
    }
    parent.document.versionControl.commit('Move Items')
  }
  onCopy (src: TreeRowInfo<Item>[], dest: TreeRowInfo<Item>, destIndex: number) {
    const parent = dest.item
    if (!(parent instanceof GroupItem)) {
      return
    }
    const beforeRef = parent.childAt(destIndex)
    for (const {item} of src) {
      const cloned = cloneItems([item])[0]
      parent.insertBefore(cloned, beforeRef)
    }
    parent.document.versionControl.commit('Copy Items')
  }
}

function peekAllItems (root: GroupItem) {
  for (const child of root.children) {
    if (child instanceof GroupItem) {
      peekAllItems(child)
    }
  }
}

@observer
export class ItemHierarchy extends React.Component<{}, {}> {
  private delegate = new ItemTreeDelegate()

  render () {
    const ItemTreeView = TreeView as new () => TreeView<Item>
    const document = documentManager.document
    const selectedKeys = new Set([...document.selectedItems].map(item => item.id))

    // FIXME: need to peek all items in ItemHierarchy#render to cause re-render
    //        bacause TreeView in react-draggable-tree is not mobx observer.
    peekAllItems(document.rootItem)

    return <div className={styles.root}>
      <ItemTreeView root={document.rootItem} selectedKeys={selectedKeys} rowHeight={28} delegate={this.delegate} />
    </div>
  }
}
