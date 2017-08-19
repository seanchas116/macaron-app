import * as React from 'react'
import { action } from 'mobx'
import { Vec2 } from 'paintvec'
import { PathItem, documentManager } from '../document'
import { toolManager, DrawArea } from '../drawarea'
import { PointerEvents } from '../../util/components/PointerEvents'

const snapDistance = 4

export
class PathToolOverlay extends React.Component<{size: Vec2}, {}> {
  startPos = new Vec2()
  item: PathItem|undefined = undefined

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
    const pos = this.startPos = DrawArea.posFromEvent(event)

    const {document} = documentManager
    const item = this.item = new PathItem(document)
    item.fillEnabled = false
    const parent = document.rootItem
    parent.insertBefore(item, parent.childAt(0))
    item.nodes.push({type: 'straight', position: pos, handle1: pos, handle2: pos})
    item.selectedPathNodes.replace([0])
    document.focusedItem = item
  }

  @action private onPointerMove = (event: PointerEvent) => {
    if (!this.item) {
      return
    }
    const pos = DrawArea.posFromEvent(event)

    if (pos.sub(this.startPos).length() < snapDistance) {
      this.item.nodes[0] = {
        position: this.startPos,
        handle1: this.startPos,
        handle2: this.startPos,
        type: 'straight'
      }
    } else {
      this.item.nodes[0] = {
        position: this.startPos,
        handle1: this.startPos.mulScalar(2).sub(pos),
        handle2: pos,
        type: 'symmetric'
      }
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    if (!this.item) {
      return
    }
    this.item.document.versionControl.commit('Add Path Item')
    this.item = undefined
    toolManager.currentId = undefined
  }
}
