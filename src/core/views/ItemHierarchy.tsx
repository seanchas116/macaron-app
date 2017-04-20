import * as React from 'react'
import {TreeView, TreeDelegate, TreeRowInfo} from 'react-draggable-tree'
import {Item} from '../items/Item'
const styles = require('./ItemHierarchy.css')
require('react-draggable-tree/lib/index.css')

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
    return undefined
  }
  getCollapsed (item: Item) {
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

export class ItemHierarchy extends React.Component<{}, {}> {
  private delegate = new ItemTreeDelegate()

  render () {
    const ItemTreeView = TreeView as new () => TreeView<Item>
    return <div className={styles.root}>
      <ItemTreeView root={document.root} selectedKeys={new Set()} rowHeight={32} delegate={this.delegate} />
    </div>
  }
}
