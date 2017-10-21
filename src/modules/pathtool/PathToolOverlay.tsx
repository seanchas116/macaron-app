import * as React from 'react'
import { action } from 'mobx'
import { Vec2 } from 'paintvec'
import { PathItem, documentManager } from '../document'
import { toolManager, PathEditor, InsertOverlay } from '../drawarea'

export
class PathToolOverlay extends React.Component<{size: Vec2}, {}> {
  private item: PathItem|undefined = undefined

  render () {
    return <InsertOverlay
      size={this.props.size}
      commitTitle='Add Path Item'
      onCreate={this.handleCreate}
      onDrag={this.handleDrag}
      onFinish={this.handleFinish}
    />
  }

  @action private handleCreate = (pos: Vec2) => {
    const {document} = documentManager
    const item = this.item = new PathItem(document)
    item.fillEnabled = false
    item.nodes.push({type: 'straight', position: pos, handle1: pos, handle2: pos})
    item.selectedPathNodes.replace([0])
    document.focusedItem = item
    return item
  }

  @action private handleDrag = (startPos: Vec2, pos: Vec2) => {
    if (!this.item) {
      return
    }
    if (pos.sub(startPos).length() < PathEditor.snapDistance) {
      this.item.nodes[0] = {
        position: startPos,
        handle1: startPos,
        handle2: startPos,
        type: 'straight'
      }
    } else {
      this.item.nodes[0] = {
        position: startPos,
        handle1: startPos.mulScalar(2).sub(pos),
        handle2: pos,
        type: 'symmetric'
      }
    }
  }

  @action private handleFinish = () => {
    toolManager.currentId = undefined
  }
}
