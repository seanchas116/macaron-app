import * as React from 'react'
import {TreeView, TreeDelegate, TreeRowInfo} from 'react-draggable-tree'
import {observer} from 'mobx-react'
import {Item} from '../items/Item'
import {GroupItem} from '../items/GroupItem'
import {documentManager} from '../DocumentManager'
const styles = require('./ItemHierarchy.css')
require('react-draggable-tree/lib/index.css')

@observer
export class ItemRow extends React.Component<{item: Item}, {}> {
  render () {
    const {item} = this.props
    return <div>{item.name}</div>
  }
}

class ItemTreeDelegate implements TreeDelegate<Item> {
  getKey (item: Item) {
    return item.id
  }
  getChildren (item: Item) {
    if (item instanceof GroupItem) {
      return item.children
    }
  }
  getCollapsed (item: Item) {
    if (item instanceof GroupItem) {
      return item.collapsed
    }
    return false
  }
  renderRow (info: TreeRowInfo<Item>) {
    return <ItemRow item={info.item} />
  }
  onSelectedKeysChange (selectedKeys: Set<number>, selectedNodeInfos: TreeRowInfo<Item>[]) {
    // TODO
  }
  onCollapsedChange (info: TreeRowInfo<Item>, collapsed: boolean) {
    // TODO
  }
  onContextMenu (info: TreeRowInfo<Item>|undefined, ev: React.MouseEvent<HTMLElement>) {
    // TODO
  }
  onMove (src: TreeRowInfo<Item>[], dest: TreeRowInfo<Item>, destIndex: number) {
    // TODO
  }
  onCopy (src: TreeRowInfo<Item>[], dest: TreeRowInfo<Item>, destIndex: number) {
    // TODO
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
    console.log('render')
    const ItemTreeView = TreeView as new () => TreeView<Item>
    const document = documentManager.document
    // FIXME: need to peek all items in ItemHierarchy#render to cause re-render
    //        bacause TreeView in react-draggable-tree is not mobx observer.
    peekAllItems(document.rootItem)
    return <div className={styles.root}>
      <ItemTreeView root={document.rootItem} selectedKeys={new Set()} rowHeight={32} delegate={this.delegate} />
    </div>
  }
}
