import * as React from 'react'
import {Vec2} from 'paintvec'
import {action} from 'mobx'
import {observer} from 'mobx-react'
import {PathItem, PathNode} from '../document'
import {itemPreview} from './ItemPreview'
import {PointerEvents} from '../../util/components/PointerEvents'

function normalizeNodes (item: PathItem) {
  const newNodes = item.nodes.map(n => ({
    type: n.type,
    position: item.transformPos(n.position),
    handle1: item.transformPos(n.handle1),
    handle2: item.transformPos(n.handle2)
  }))
  item.nodes.replace(newNodes)
  item.offset = new Vec2()
  item.resizedSize = undefined
}

@observer
class PathNodeHandle extends React.Component<{item: PathItem, index: number}, {}> {
  drag: {
    startPos: Vec2
    origNode: PathNode
  } | undefined

  @action onPointerDown = (event: PointerEvent) => {
    (event.target as Element).setPointerCapture(event.pointerId)
    const {item, index} = this.props
    const preview = itemPreview.addItem(item)
    normalizeNodes(preview)
    this.drag = {
      startPos: new Vec2(event.clientX, event.clientY),
      origNode: {...preview.nodes[index]}
    }
  }

  @action onPointerMove = (event: PointerEvent) => {
    if (!this.drag) {
      return
    }
    const preview = itemPreview.getItem(this.props.item)
    if (!preview) {
      return
    }
    const {origNode, startPos} = this.drag
    const currentPos = new Vec2(event.clientX, event.clientY)
    const offset = currentPos.sub(startPos)
    // TODO: get absolute pos from event
    const newNode = {
      type: origNode.type,
      position: origNode.position.add(offset),
      handle1: origNode.handle1.add(offset),
      handle2: origNode.handle2.add(offset)
    }
    preview.nodes[this.props.index] = newNode
  }

  @action onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    // TODO: commit
    itemPreview.clear()
  }

  render () {
    const {item, index} = this.props
    const preview = itemPreview.previewItem(item)
    const node = preview.nodes[index]
    const p = preview.transformPos(node.position)
    const h1 = preview.transformPos(node.handle1)
    const h2 = preview.transformPos(node.handle2)
    if (node.type === 'straight') {
      return <g>
        <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
      </g>
    } else {
      return <PointerEvents
        onPointerDown={this.onPointerDown}
        onPointerMove={this.onPointerMove}
        onPointerUp={this.onPointerUp} >
        <g>
          <line x1={p.x} y1={p.y} x2={h1.x} y2={h1.y} stroke='lightgray' />
          <line x1={p.x} y1={p.y} x2={h2.x} y2={h2.y} stroke='lightgray' />
          <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
          <circle cx={h1.x} cy={h1.y} r={2} fill='white' stroke='grey' />
          <circle cx={h2.x} cy={h2.y} r={2} fill='white' stroke='grey' />
        </g>
      </PointerEvents>
    }
  }
}

@observer
export class PathHandles extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)

    return <g>
      {preview.nodes.map((n, i) => <PathNodeHandle item={item} index={i} key={i} />)}
    </g>
  }
}
