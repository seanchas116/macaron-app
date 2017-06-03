import * as React from 'react'
import {action} from 'mobx'
import {Vec2} from 'paintvec'
import {GroupItem, PathNode, PathItem, documentManager, ItemInsertCommand} from '../document'
import {itemPreview, drawAreaMode, toolManager} from '../drawarea'
import {PointerEvents} from '../../util/components/PointerEvents'

const snapDistance = 3

export
class PathToolOverlay extends React.Component<{size: Vec2}, {}> {
  clicked = false
  editingInfo: {
    parent: GroupItem
    item: PathItem
    hasPreviewNode?: boolean
    closingNode?: boolean
    draggingHandle?: boolean
  } | undefined

  @action onKeyDown (event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      this.endEditing()
    }
  }

  render () {
    const {width, height} = this.props.size
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
    >
      <rect width={width} height={height} fill='transparent' />
    </PointerEvents>
  }

  @action private onPointerDown = (event: PointerEvent) => {
    this.clicked = true
    const pos = this.eventPos(event)
    if (this.editingInfo) {
      const {item} = this.editingInfo
      if (pos.sub(item.nodes[0].position).length() < snapDistance) {
        this.editingInfo.closingNode = true
        item.closed = true
      } else {
        this.removePreviewNode()
        item.nodes.push({position: pos, handle1: pos, handle2: pos, type: 'straight'})
      }
    } else {
      this.startEditing(pos)
    }
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const pos = this.eventPos(event)
    if (!this.editingInfo) {
      return
    }
    const {item} = this.editingInfo
    if (this.clicked) {
      if (!this.editingInfo.draggingHandle) {
        const distance = pos.sub(item.nodes[item.nodes.length - 1].position).length()
        if (distance < snapDistance) {
          return
        }
        this.editingInfo.draggingHandle = true
      }
      const node = this.editingInfo.closingNode ? item.nodes[0] : item.nodes[item.nodes.length - 1]
      node.handle1 = node.position.mulScalar(2).sub(pos)
      node.handle2 = pos
      node.type = 'symmetric'
    } else {
      if (pos.sub(item.nodes[0].position).length() < snapDistance) {
        this.removePreviewNode()
        item.closed = true
      } else {
        this.setPreviewNode({position: pos, handle1: pos, handle2: pos, type: 'straight'})
        item.closed = false
      }
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.clicked = false
    if (!this.editingInfo) {
      return
    }
    this.editingInfo.draggingHandle = false
    const {item} = this.editingInfo
    if (this.editingInfo.closingNode) {
      this.endEditing()
    } else {
      const lastEdge = item.nodes[item.nodes.length - 1]
      this.setPreviewNode(lastEdge)
    }
  }

  private eventPos (event: PointerEvent) {
    const pos = new Vec2(event.offsetX, event.offsetY)
    return pos.add(documentManager.document.scroll)
  }

  private startEditing (pos: Vec2) {
    const {document} = documentManager
    const item = new PathItem(document)
    item.fillEnabled = false
    const parent = document.rootItem
    const children = [item, ...parent.children]
    itemPreview.addChildren(parent, children)
    item.nodes.push({type: 'straight', position: pos, handle1: pos, handle2: pos})
    this.editingInfo = {item, parent}
    drawAreaMode.focusedItem = item
  }

  private endEditing () {
    if (this.editingInfo) {
      this.commit()
      this.editingInfo = undefined
    }
  }

  private setPreviewNode (node: PathNode) {
    if (!this.editingInfo) {
      return
    }
    if (this.editingInfo.hasPreviewNode) {
      this.editingInfo.item.nodes.pop()
    }
    this.editingInfo.item.nodes.push(node)
    this.editingInfo.hasPreviewNode = true
  }

  private removePreviewNode () {
    if (!this.editingInfo) {
      return
    }
    if (this.editingInfo.hasPreviewNode) {
      this.editingInfo.item.nodes.pop()
    }
    this.editingInfo.hasPreviewNode = false
  }

  @action private commit () {
    if (!this.editingInfo) {
      return
    }
    const {parent, item} = this.editingInfo
    this.removePreviewNode()
    itemPreview.clear()
    const {document} = documentManager
    document.history.push(new ItemInsertCommand('Add Item', parent, item, parent.childAt(0)))
    document.selectedItems.replace([item])
    drawAreaMode.focusedItem = undefined
    toolManager.current = undefined
  }
}
