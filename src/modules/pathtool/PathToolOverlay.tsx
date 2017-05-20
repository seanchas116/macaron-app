import * as React from 'react'
import {action} from 'mobx'
import {Vec2} from 'paintvec'
import {GroupItem, PathItem, documentManager, ItemInsertCommand} from '../document'
import {itemPreview, drawAreaMode} from '../drawarea'
import {PointerEvents} from '../../util/components/PointerEvents'

export
class PathToolOverlay extends React.Component<{size: Vec2}, {}> {
  clicked = false
  editingInfo: {
    parent: GroupItem
    item: PathItem
  } | undefined

  private onPointerDown = action((event: PointerEvent) => {
    this.clicked = true
    const pos = new Vec2(event.offsetX, event.offsetY)
    if (this.editingInfo) {
      const {item} = this.editingInfo
      item.edges.pop() // pop preview edge
      item.edges.push({
        position: pos,
        handles: [pos, pos],
        type: 'straight'
      })
    } else {
      this.startEditing(pos)
    }
  })

  private onPointerMove = action((event: PointerEvent) => {
    const pos = new Vec2(event.offsetX, event.offsetY)
    if (this.editingInfo) {
      const {item} = this.editingInfo
      if (this.clicked) {
        const edge = item.edges.pop()!
        const {position} = edge
        const handles: [Vec2, Vec2] = [position.mulScalar(2).sub(pos), pos]
        item.edges.push({
          position, handles, type: 'symmetric'
        })
      } else {
        // preview next curve
        item.edges.pop()
        item.edges.push({
          position: pos,
          handles: [pos, pos],
          type: 'straight'
        })
      }
    }
  })

  private onPointerUp = action((event: PointerEvent) => {
    this.clicked = false
    if (this.editingInfo) {
      const {item} = this.editingInfo
      const lastEdge = item.edges[item.edges.length - 1]
      item.edges.push(lastEdge) // for preview on hover
    }
  })

  @action onKeyDown (event: React.KeyboardEvent<HTMLElement>) {
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
    item.fillEnabled = false
    const parent = document.rootItem
    const children = [item, ...parent.children]
    itemPreview.addChildren(parent, children)
    item.edges.push({
      position: pos,
      handles: [pos, pos],
      type: 'straight'
    })
    this.editingInfo = {item, parent}
    drawAreaMode.pathItemToEdit = item
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
    drawAreaMode.pathItemToEdit = undefined
  }
}
