import * as React from 'react'
import { TreeView, TreeNode, TreeRowInfo } from 'react-draggable-tree'
import { observer } from 'mobx-react'
import * as classNames from 'classnames'

import { Item, documentManager, cloneItems } from '../document'

const styles = require('./ItemHierarchy.css')
require('react-draggable-tree/lib/index.css')

const itemToTreeNode = (item: Item): TreeNode => {
  return {
    key: item.id,
    children: item.canHaveChildren ? item.children.map(itemToTreeNode) : undefined,
    collapsed: item.collapsed
  }
}

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

@observer
export class ItemHierarchy extends React.Component<{}, {}> {
  render () {
    const document = documentManager.document
    const selectedKeys = new Set([...document.selectedItems].map(item => item.id))

    return <div className={styles.root}>
      <TreeView
        root={itemToTreeNode(document.rootItem)}
        selectedKeys={selectedKeys}
        rowHeight={28}
        renderRow={this.renderRow}
        onSelectedKeysChange={this.onSelectedKeysChange}
        onCollapsedChange={this.onCollapsedChange}
        onContextMenu={this.onContextMenu}
        onMove={this.onMove}
        onCopy={this.onCopy}
      />
    </div>
  }

  private getItem (node: TreeNode) {
    return documentManager.document.itemForId.get(node.key as string)!
  }

  private renderRow = (info: TreeRowInfo) => {
    return <ItemRow item={this.getItem(info.node)} selected={info.selected} />
  }

  private onSelectedKeysChange = (selectedKeys: Set<number>, selectedNodeInfos: TreeRowInfo[]) => {
    documentManager.document.selectedItems.replace(selectedNodeInfos.map(info => this.getItem(info.node)))
  }
  private onCollapsedChange = (info: TreeRowInfo, collapsed: boolean) => {
    this.getItem(info.node).collapsed = collapsed
  }
  private onContextMenu = (info: TreeRowInfo|undefined, ev: React.MouseEvent<HTMLElement>) => {
    // TODO
  }
  private onMove = (src: TreeRowInfo[], dest: TreeRowInfo, destIndex: number, destIndexAfter: number) => {
    const parent = this.getItem(dest.node)
    if (!parent.canHaveChildren) {
      return
    }
    const beforeRef = parent.childAt(destIndex)
    for (const item of src.map(s => this.getItem(s.node))) {
      parent.insertBefore(item, beforeRef)
    }
    parent.document.versionControl.commit('Move Items')
  }
  private onCopy = (src: TreeRowInfo[], dest: TreeRowInfo, destIndex: number) => {
    const parent = this.getItem(dest.node)
    if (!parent.canHaveChildren) {
      return
    }
    const beforeRef = parent.childAt(destIndex)
    for (const item of src.map(s => this.getItem(s.node))) {
      const cloned = cloneItems([item])[0]
      parent.insertBefore(cloned, beforeRef)
    }
    parent.document.versionControl.commit('Copy Items')
  }
}
