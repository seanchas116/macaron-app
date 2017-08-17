import * as React from 'react'
import { Vec2 } from 'paintvec'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { PathItem, PathNode, PathUtil } from '../document'
import { DrawArea } from './DrawArea'
import { PointerEvents } from '../../util/components/PointerEvents'

const snapDistance = 4

function isOnlyFirstSelected (item: PathItem) {
  const {selectedPathNodes} = item.document
  return selectedPathNodes.size === 1 && selectedPathNodes.has(0)
}
function isOnlyLastSelected (item: PathItem) {
  const {selectedPathNodes} = item.document
  return selectedPathNodes.size === 1 && selectedPathNodes.has(item.nodes.length - 1)
}
function getInsertMode (item: PathItem) {
  if (item.closed) {
    return 'none'
  }
  if (isOnlyFirstSelected(item)) {
    return 'prepend'
  }
  if (isOnlyLastSelected(item)) {
    return 'append'
  }
  return 'none'
}

@observer
class PathNodeHandle extends React.Component<{item: PathItem, index: number}, {}> {
  private drag: {
    origNodes: Map<number, PathNode>
    draggedNodePos: Vec2
  } | undefined = undefined
  private closingPathDrag: {
    startPos: Vec2
    insertMode: 'append' | 'prepend' | 'none'
  } | undefined = undefined

  render () {
    const {item, index} = this.props
    const node = item.nodes[index]
    const p = node.position
    const h1 = node.handle1
    const h2 = node.handle2
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

  @action private onPointerDown = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    (event.target as Element).setPointerCapture(event.pointerId)
    const {item, index} = this.props

    if (target === 'position' && item.isInsertingNode) {
      this.closingPathDrag = {
        startPos: DrawArea.posFromEvent(event),
        insertMode: getInsertMode(this.props.item)
      }
    } else {
      const origNodes = new Map<number, PathNode>()
      if (target === 'position') {
        const {document} = item
        if (event.shiftKey) {
          document.selectedPathNodes.add(index)
        } else if (!document.selectedPathNodes.has(index)) {
          document.selectedPathNodes.replace([index])
        }
        for (const i of document.selectedPathNodes) {
          origNodes.set(i , {...item.nodes[i]})
        }
      } else {
        origNodes.set(index, {...item.nodes[index]})
      }
      this.drag = {origNodes, draggedNodePos: item.nodes[index].position}
    }
  }

  private onPointerDownPosition = (e: PointerEvent) => this.onPointerDown('position', e)
  private onPointerDownHandle1 = (e: PointerEvent) => this.onPointerDown('handle1', e)
  private onPointerDownHandle2 = (e: PointerEvent) => this.onPointerDown('handle2', e)

  @action private onPointerMove = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    const {item} = this.props
    if (target === 'position' && item.isInsertingNode) {
      const insertMode = getInsertMode(item)
      if (insertMode === 'prepend') {
        item.prependPreview = {...item.nodes[item.nodes.length - 1]}
      } else if (insertMode === 'append') {
        item.appendPreview = {...item.nodes[0]}
      }
    }

    const dragPos = DrawArea.posFromEvent(event)

    if (this.closingPathDrag) {
      if (dragPos.sub(this.closingPathDrag.startPos).length() > snapDistance) {
        if (this.closingPathDrag.insertMode === 'prepend') {
          const index = item.nodes.length - 1
          item.nodes[index].type = 'symmetric'
          item.nodes[index] = PathUtil.moveHandle(item.nodes[index], 'handle1', DrawArea.posFromEvent(event))
        } else {
          const index = 0
          item.nodes[index].type = 'symmetric'
          item.nodes[index] = PathUtil.moveHandle(item.nodes[index], 'handle2', DrawArea.posFromEvent(event))
        }
      }
    }

    if (this.drag) {
      for (const [index, origNode] of this.drag.origNodes) {
        const pos = dragPos.add(origNode.position.sub(this.drag.draggedNodePos))
        item.nodes[index] = PathUtil.moveHandle(origNode, target, pos)
      }
    }
  }

  private onPointerMovePosition = (e: PointerEvent) => this.onPointerMove('position', e)
  private onPointerMoveHandle1 = (e: PointerEvent) => this.onPointerMove('handle1', e)
  private onPointerMoveHandle2 = (e: PointerEvent) => this.onPointerMove('handle2', e)

  @action private onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    this.closingPathDrag = undefined
    const {item} = this.props
    item.document.versionControl.commit('Move Path Node')
    if (item.isInsertingNode) {
      item.closed = true
      item.isInsertingNode = false
      item.prependPreview = undefined
      item.appendPreview = undefined
    }
  }
}

class PathEditorBackground extends React.Component<{item: PathItem, width: number, height: number}, {}> {
  private dragStartPos = new Vec2()
  private dragInsertMode: 'none'|'prepend'|'append' = 'none'

  render () {
    return <PointerEvents
      onPointerDown = {this.onPointerDown} onPointerMove={this.onPointerMove} onPointerUp={this.onPointerUp}>
      <rect
        x={0} y={0} width={this.props.width} height={this.props.height}
        fill='transparent'
        onClick={this.onClick} onDoubleClick={this.onDoubleClick} />
    </PointerEvents>
  }

  @action private onPointerDown = (event: PointerEvent) => {
    const insertMode = this.dragInsertMode = getInsertMode(this.props.item)
    this.dragStartPos = DrawArea.posFromEvent(event)
    if (insertMode !== 'none') {
      this.onInsertPointerDown(event)
    }
  }

  @action private onPointerMove = (event: PointerEvent) => {
    if (this.dragInsertMode !== 'none') {
      this.onInsertPointerDrag(event)
    } else if (getInsertMode(this.props.item) !== 'none') {
      this.onInsertPointerHover(event)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.dragInsertMode = 'none'
    if (getInsertMode(this.props.item) !== 'none') {
      this.onInsertPointerUp(event)
    }
  }

  @action private onInsertPointerDown = (event: PointerEvent) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    const {item} = this.props
    const {document} = item
    const pos = DrawArea.posFromEvent(event)
    const node: PathNode = {type: 'straight', position: pos, handle1: pos, handle2: pos}
    if (getInsertMode(item) === 'prepend') {
      item.nodes.unshift(node)
      document.selectedPathNodes.replace([0])
    } else {
      item.nodes.push(node)
      document.selectedPathNodes.replace([item.nodes.length - 1])
    }
    item.appendPreview = item.prependPreview = undefined
  }

  @action private onInsertPointerDrag = (event: PointerEvent) => {
    const {item} = this.props
    const pos = DrawArea.posFromEvent(event)
    if (pos.sub(this.dragStartPos).length() <= snapDistance) {
      return
    }
    if (this.dragInsertMode === 'append') {
      const node = item.nodes[item.nodes.length - 1]
      if (node) {
        const newNode: PathNode = {
          type: 'symmetric',
          position: node.position,
          handle1: node.position.mulScalar(2).sub(pos),
          handle2: pos
        }
        item.nodes[item.nodes.length - 1] = newNode
      }
    } else {
      const node = item.nodes[0]
      if (node) {
        const newNode: PathNode = {
          type: 'symmetric',
          position: node.position,
          handle1: pos,
          handle2: node.position.mulScalar(2).sub(pos)
        }
        item.nodes[0] = newNode
      }
    }
  }

  @action private onInsertPointerHover = (event: PointerEvent) => {
    const {item} = this.props
    const insertMode = getInsertMode(item)
    const pos = DrawArea.posFromEvent(event)
    const node: PathNode = {type: 'straight', position: pos, handle1: pos, handle2: pos}
    if (insertMode === 'prepend') {
      item.prependPreview = node
    } else if (insertMode === 'append') {
      item.appendPreview = node
    }
    item.isInsertingNode = true
    item.closed = false
  }

  @action private onInsertPointerUp = (event: PointerEvent) => {
    this.props.item.document.versionControl.commit('Add Path Node')
  }

  @action private onClick = () => {
    const {document} = this.props.item
    document.selectedPathNodes.clear()
  }

  @action private onDoubleClick = () => {
    const {document} = this.props.item
    document.focusedItem = undefined
  }
}

interface PathEditorProps {
  item: PathItem
  width: number
  height: number
}

@observer export class PathEditor extends React.Component<PathEditorProps, {}> {
  componentWillReceiveProps (newProps: PathEditorProps) {
    newProps.item.normalizeNodes()
  }

  componentDidMount () {
    this.props.item.normalizeNodes()
  }

  render () {
    const {item} = this.props
    const {scroll} = item.document

    return <g>
      <PathEditorBackground item={item} width={this.props.width} height={this.props.height} />
      <g transform={`translate(${-scroll.x}, ${-scroll.y})`}>
        {item.nodes.map((n, i) => <PathNodeHandle item={item} index={i} key={i} />)}
      </g>
    </g>
  }
}
