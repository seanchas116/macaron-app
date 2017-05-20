import * as React from 'react'
import {action} from 'mobx'
import {Vec2} from 'paintvec'
import {GroupItem, PathItem, PathEdge, documentManager, ItemInsertCommand} from '../document'
import {itemPreview} from '../drawarea'
import {PointerEvents} from '../../util/components/PointerEvents'

export
class PathToolOverlay extends React.Component<{size: Vec2}, {}> {
  editingInfo: {
    parent: GroupItem
    item: PathItem
  } | undefined

  private onPointerDown = action((event: PointerEvent) => {
    const pos = new Vec2(event.offsetX, event.offsetY)
    if (this.editingInfo) {
      const {item} = this.editingInfo
      item.edges.pop()
      const newEdge: PathEdge = {
        position: pos,
        handles: [pos, pos],
        type: 'straight'
      }
      item.edges.push(newEdge, newEdge) // pushing twice (latter is for preview on pointer move)
    } else {
      this.startEditing(pos)
    }
  })

  private onPointerMove = action((event: PointerEvent) => {
    const pos = new Vec2(event.offsetX, event.offsetY)
    if (this.editingInfo) {
      const {item} = this.editingInfo
      item.edges.pop()
      item.edges.push({
        position: pos,
        handles: [pos, pos],
        type: 'straight'
      })
    }
  })

  private onPointerUp = action((event: PointerEvent) => {
    // TODO
  })

  @action onKeyDown (event: KeyboardEvent) {
    if (event.key === 'Enter') {
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

  private startEditing (pos: Vec2) {
    const {document} = documentManager
    const item = new PathItem(document)
    const parent = document.rootItem
    const children = [item, ...parent.children]
    itemPreview.addChildren(parent, children)
    const edge: PathEdge = {
      position: pos,
      handles: [pos, pos],
      type: 'straight'
    }
    item.edges.push(edge, edge)
    this.editingInfo = {item, parent}
  }

  private endEditing () {
    if (this.editingInfo) {
      this.commit()
      this.editingInfo = undefined
    }
  }

  @action private commit () {
    if (!this.editingInfo) {
      return
    }
    const {parent, item} = this.editingInfo
    const {document} = documentManager
    document.history.push(new ItemInsertCommand('Add Item', parent, item, parent.childAt(0)))
    document.selectedItems.replace([item])
  }
}
