import * as React from 'react'
import {Vec2} from 'paintvec'
import {action} from 'mobx'
import {observer} from 'mobx-react'
import {PathItem, PathNode, PathUtil, ItemChangeCommand} from '../document'
import {DrawArea} from './DrawArea'
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
    origNode: PathNode
  } | undefined

  @action onPointerDown = (event: PointerEvent) => {
    (event.target as Element).setPointerCapture(event.pointerId)
    const {item, index} = this.props
    const preview = itemPreview.addItem(item)
    normalizeNodes(preview)
    this.drag = {
      origNode: {...preview.nodes[index]}
    }
    const {document} = item
    if (event.shiftKey) {
      document.selectedPathNodes.add(index)
    } else {
      document.selectedPathNodes.replace([index])
    }
  }

  @action onPointerMove = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    if (!this.drag) {
      return
    }
    const preview = itemPreview.getItem(this.props.item)
    if (!preview) {
      return
    }
    const {origNode} = this.drag
    const pos = DrawArea.posFromEvent(event)

    let newNode: PathNode
    switch (target) {
      default:
      case 'position': {
        const offset = pos.sub(origNode.position)
        newNode = {
          type: origNode.type,
          position: pos,
          handle1: origNode.handle1.add(offset),
          handle2: origNode.handle2.add(offset)
        }
        break
      }
      case 'handle1': {
        const handle1 = pos
        const handle2 = PathUtil.getOppositeHandle(origNode.type, origNode.position, handle1, origNode.handle2)
        newNode = {
          type: origNode.type,
          position: origNode.position,
          handle1, handle2
        }
        break
      }
      case 'handle2': {
        const handle2 = pos
        const handle1 = PathUtil.getOppositeHandle(origNode.type, origNode.position, handle2, origNode.handle1)
        newNode = {
          type: origNode.type,
          position: origNode.position,
          handle1, handle2
        }
        break
      }
    }

    preview.nodes[this.props.index] = newNode
  }

  onPointerMovePosition = (e: PointerEvent) => this.onPointerMove('position', e)
  onPointerMoveHandle1 = (e: PointerEvent) => this.onPointerMove('handle1', e)
  onPointerMoveHandle2 = (e: PointerEvent) => this.onPointerMove('handle2', e)

  @action onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    const {item} = this.props
    const {document} = item
    const preview = itemPreview.getItem(item)
    if (!preview) {
      return
    }
    document.history.push(new ItemChangeCommand('Move Path', item, {
      nodeArray: preview.nodeArray,
      offset: new Vec2(),
      resizedSize: undefined
    }))
    itemPreview.clear()
  }

  render () {
    const {item, index} = this.props
    const preview = itemPreview.previewItem(item)
    const node = preview.nodes[index]
    const p = preview.transformPos(node.position)
    const h1 = preview.transformPos(node.handle1)
    const h2 = preview.transformPos(node.handle2)
    const selected = item.document.selectedPathNodes.has(index)
    console.log(index, item.document.selectedPathNodes)
    if (node.type === 'straight') {
      return <g>
        <PointerEvents onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMovePosition} onPointerUp={this.onPointerUp} >
          <circle cx={p.x} cy={p.y} r={4} fill='white' stroke='grey' />
        </PointerEvents>
      </g>
    } else {
      return <g>
        <line x1={p.x} y1={p.y} x2={h1.x} y2={h1.y} stroke='lightgray' />
        <line x1={p.x} y1={p.y} x2={h2.x} y2={h2.y} stroke='lightgray' />
        <PointerEvents onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMovePosition} onPointerUp={this.onPointerUp} >
          <circle cx={p.x} cy={p.y} r={4} fill={selected ? 'blue' : 'white'} stroke='grey' />
        </PointerEvents>
        <PointerEvents onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMoveHandle1} onPointerUp={this.onPointerUp} >
          <circle cx={h1.x} cy={h1.y} r={3} fill='white' stroke='grey' />
        </PointerEvents>
        <PointerEvents onPointerDown={this.onPointerDown} onPointerMove={this.onPointerMoveHandle2} onPointerUp={this.onPointerUp} >
          <circle cx={h2.x} cy={h2.y} r={3} fill='white' stroke='grey' />
        </PointerEvents>
      </g>
    }
  }
}

@observer
export class PathHandles extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const {scroll} = item.document

    return <g transform={`translate(${-scroll.x}, ${-scroll.y})`}>
      {preview.nodes.map((n, i) => <PathNodeHandle item={item} index={i} key={i} />)}
    </g>
  }
}
