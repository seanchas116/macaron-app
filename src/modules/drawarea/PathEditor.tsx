import * as React from 'react'
import {Vec2} from 'paintvec'
import {action} from 'mobx'
import {observer} from 'mobx-react'
import {PathItem, PathNode, PathUtil, ItemChangeCommand} from '../document'
import {DrawArea} from './DrawArea'
import {itemPreview} from './ItemPreview'
import {PointerEvents} from '../../util/components/PointerEvents'

const snapDistance = 4

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
class PathNodeHandle extends React.Component<{item: PathItem, preview: PathItem, index: number}, {}> {
  drag: {
    origNodes: Map<number, PathNode>
    draggedNodePos: Vec2
  } | undefined

  @action onPointerDown = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    (event.target as Element).setPointerCapture(event.pointerId)
    const {item, index, preview} = this.props
    normalizeNodes(preview)

    const origNodes = new Map<number, PathNode>()
    if (target === 'position') {
      const {document} = item
      if (event.shiftKey) {
        document.selectedPathNodes.add(index)
      } else if (!document.selectedPathNodes.has(index)) {
        document.selectedPathNodes.replace([index])
      }
      for (const i of document.selectedPathNodes) {
        origNodes.set(i , {...preview.nodes[i]})
      }
    } else {
      origNodes.set(index, {...preview.nodes[index]})
    }
    this.drag = {origNodes, draggedNodePos: preview.nodes[index].position}
  }

  onPointerDownPosition = (e: PointerEvent) => this.onPointerDown('position', e)
  onPointerDownHandle1 = (e: PointerEvent) => this.onPointerDown('handle1', e)
  onPointerDownHandle2 = (e: PointerEvent) => this.onPointerDown('handle2', e)

  @action onPointerMove = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    if (!this.drag) {
      return
    }
    const {preview} = this.props
    const dragPos = DrawArea.posFromEvent(event)

    for (const [index, origNode] of this.drag.origNodes) {
      const pos = dragPos.add(origNode.position.sub(this.drag.draggedNodePos))
      preview.nodes[index] = PathUtil.moveHandle(origNode, target, pos)
    }
  }

  onPointerMovePosition = (e: PointerEvent) => this.onPointerMove('position', e)
  onPointerMoveHandle1 = (e: PointerEvent) => this.onPointerMove('handle1', e)
  onPointerMoveHandle2 = (e: PointerEvent) => this.onPointerMove('handle2', e)

  @action onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    const {item, preview} = this.props
    const {document} = item
    document.history.push(new ItemChangeCommand('Move Path', item, {
      nodeArray: preview.nodeArray,
      offset: new Vec2(),
      resizedSize: undefined
    }))
  }

  render () {
    const {preview, index} = this.props
    const node = preview.nodes[index]
    const p = preview.transformPos(node.position)
    const h1 = preview.transformPos(node.handle1)
    const h2 = preview.transformPos(node.handle2)
    const selected = this.props.item.document.selectedPathNodes.has(index)

    const positionHandle = <PointerEvents onPointerDown={this.onPointerDownPosition} onPointerMove={this.onPointerMovePosition} onPointerUp={this.onPointerUp} >
      <circle cx={p.x} cy={p.y} r={4} fill={selected ? '#2196f3' : 'white'} stroke='grey' />
    </PointerEvents>

    if (node.type === 'straight') {
      return <g>{positionHandle}</g>
    } else {
      return <g>
        <line x1={p.x} y1={p.y} x2={h1.x} y2={h1.y} stroke='lightgray' />
        <line x1={p.x} y1={p.y} x2={h2.x} y2={h2.y} stroke='lightgray' />
        {positionHandle}
        <PointerEvents onPointerDown={this.onPointerDownHandle1} onPointerMove={this.onPointerMoveHandle1} onPointerUp={this.onPointerUp} >
          <circle cx={h1.x} cy={h1.y} r={3} fill='white' stroke='grey' />
        </PointerEvents>
        <PointerEvents onPointerDown={this.onPointerDownHandle2} onPointerMove={this.onPointerMoveHandle2} onPointerUp={this.onPointerUp} >
          <circle cx={h2.x} cy={h2.y} r={3} fill='white' stroke='grey' />
        </PointerEvents>
      </g>
    }
  }
}

export class PathNodeAddOverlay extends React.Component<{width: number, height: number, item: PathItem, preview: PathItem, onFinish: () => void}, {}> {
  clicked = false
  hasPreviewNode = false
  closingNode = false
  draggingHandle = false

  render () {
    const {width, height} = this.props
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
    const pos = DrawArea.posFromEvent(event)
    const {preview} = this.props
    if (pos.sub(preview.nodes[0].position).length() < snapDistance) {
      this.closingNode = true
      preview.closed = true
    } else {
      this.removePreviewNode()
      preview.nodes.push({position: pos, handle1: pos, handle2: pos, type: 'straight'})
    }
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const pos = DrawArea.posFromEvent(event)
    const {preview} = this.props
    if (this.clicked) {
      if (!this.draggingHandle) {
        const distance = pos.sub(preview.nodes[preview.nodes.length - 1].position).length()
        if (distance < snapDistance) {
          return
        }
        this.draggingHandle = true
      }
      const node = this.closingNode ? preview.nodes[0] : preview.nodes[preview.nodes.length - 1]
      node.handle1 = node.position.mulScalar(2).sub(pos)
      node.handle2 = pos
      node.type = 'symmetric'
    } else {
      if (pos.sub(preview.nodes[0].position).length() < snapDistance) {
        this.removePreviewNode()
        preview.closed = true
      } else {
        this.setPreviewNode({position: pos, handle1: pos, handle2: pos, type: 'straight'})
        preview.closed = false
      }
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.clicked = false
    this.draggingHandle = false
    const {preview} = this.props
    this.commit()
    if (this.closingNode) {
      this.props.onFinish()
    } else {
      const lastEdge = preview.nodes[preview.nodes.length - 1]
      this.setPreviewNode(lastEdge)
    }
  }

  private setPreviewNode (node: PathNode) {
    this.removePreviewNode()
    this.props.preview.nodes.push(node)
    this.hasPreviewNode = true
  }

  private removePreviewNode () {
    if (this.hasPreviewNode) {
      this.props.preview.nodes.pop()
    }
    this.hasPreviewNode = false
  }

  @action private commit () {
    const {item, preview} = this.props
    const {document} = item
    const nodeArray = this.hasPreviewNode ? preview.nodeArray.slice(0, -1) : preview.nodeArray
    document.history.push(new ItemChangeCommand('Move Path', item, {
      nodeArray,
      offset: new Vec2(),
      resizedSize: undefined,
      closed: preview.closed
    }))
  }
}

@observer export class PathEditor extends React.Component<{item: PathItem, width: number, height: number}, {}> {
  preview = itemPreview.addItem(this.props.item)

  componentWillUnmount () {
    itemPreview.clear()
  }

  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const {scroll} = item.document

    return <g>
      <rect
        x={0} y={0} width={this.props.width} height={this.props.height}
        fill='transparent'
        onClick={this.onClickOutside} onDoubleClick={this.onDoubleClickOutside} />
      <g transform={`translate(${-scroll.x}, ${-scroll.y})`}>
        {preview.nodes.map((n, i) => <PathNodeHandle item={item} preview={this.preview} index={i} key={i} />)}
      </g>
    </g>
  }

  @action private onClickOutside = () => {
    const {document} = this.props.item
    document.selectedPathNodes.clear()
  }

  @action private onDoubleClickOutside = () => {
    const {document} = this.props.item
    document.focusedItem = undefined
  }
}
