import * as React from 'react'
import {Vec2} from 'paintvec'
import {action, observable, reaction, computed, IObservableArray} from 'mobx'
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

class PathEditorState {
  readonly nodes: IObservableArray<PathNode>
  @observable closed: boolean
  @observable insertPreview: PathNode|undefined = undefined

  @computed get isOnlyFirstSelected () {
    const {selectedPathNodes} = this.item.document
    return selectedPathNodes.size === 1 && selectedPathNodes.has(0)
  }
  @computed get isOnlyLastSelected () {
    const {selectedPathNodes} = this.item.document
    return selectedPathNodes.size === 1 && selectedPathNodes.has(this.nodes.length - 1)
  }

  @computed get insertMode () {
    if (this.item.closed) {
      return 'none'
    }
    if (this.isOnlyFirstSelected) {
      return 'prepend'
    }
    if (this.isOnlyLastSelected) {
      return 'append'
    }
    return 'none'
  }

  @computed get nodesWithInsertPreview () {
    const nodes = [...this.nodes]
    if (this.insertPreview && !this.closed) {
      if (this.insertMode === 'prepend') {
        nodes.unshift(this.insertPreview)
      } else if (this.insertMode === 'append') {
        nodes.push(this.insertPreview)
      }
    }
    return Object.freeze(nodes)
  }

  private readonly preview: PathItem
  private disposers: (() => void)[]

  constructor (public readonly item: PathItem) {
    this.preview = itemPreview.addItem(this.item)
    normalizeNodes(this.preview)
    this.nodes = observable([...this.preview.nodes])
    this.closed = this.preview.closed

    this.disposers = [
      reaction(() => this.closed, closed => {
        this.preview.closed = closed
      }),
      reaction(() => [...this.item.nodes], nodes => {
        this.nodes.replace(nodes)
      }),
      reaction(() => [...this.nodesWithInsertPreview], nodes => {
        this.preview.nodes.replace(nodes)
      })
    ]
  }

  dispose () {
    this.disposers.forEach(d => d())
    itemPreview.clear()
  }

  commit () {
    this.item.document.history.push(new ItemChangeCommand('Move Path', this.item, {
      nodeArray: [...this.nodes],
      closed: this.preview.closed,
      offset: this.preview.offset,
      resizedSize: this.preview.resizedSize
    }))
  }
}

@observer
class PathNodeHandle extends React.Component<{item: PathItem, index: number, state: PathEditorState}, {}> {
  drag: {
    startPos: Vec2
    origNodes: Map<number, PathNode>
    draggedNodePos: Vec2
    closingPath: boolean
    closingInsertMode: 'append' | 'prepend' | 'none'
  } | undefined

  get closingPath () {
    const {state, index, item} = this.props
    if (item.closed) {
      return false
    }
    if (state.isOnlyFirstSelected) {
      return index === state.nodes.length - 1
    }
    if (state.isOnlyLastSelected) {
      return index === 0
    }
    return false
  }

  @action onPointerDown = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    (event.target as Element).setPointerCapture(event.pointerId)
    const {item, index, state} = this.props
    const {closingPath} = this
    const closingInsertMode = state.insertMode

    const origNodes = new Map<number, PathNode>()
    if (target === 'position') {
      const {document} = item
      if (event.shiftKey) {
        document.selectedPathNodes.add(index)
      } else if (!document.selectedPathNodes.has(index)) {
        document.selectedPathNodes.replace([index])
      }
      for (const i of document.selectedPathNodes) {
        origNodes.set(i , {...state.nodes[i]})
      }
    } else {
      origNodes.set(index, {...state.nodes[index]})
    }
    this.drag = {startPos: DrawArea.posFromEvent(event), origNodes, draggedNodePos: state.nodes[index].position, closingPath, closingInsertMode}
  }

  onPointerDownPosition = (e: PointerEvent) => this.onPointerDown('position', e)
  onPointerDownHandle1 = (e: PointerEvent) => this.onPointerDown('handle1', e)
  onPointerDownHandle2 = (e: PointerEvent) => this.onPointerDown('handle2', e)

  @action onPointerMove = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    const {state} = this.props
    if (target === 'position' && this.closingPath) {
      state.closed = true
    } else {
      state.insertPreview = undefined
    }

    if (this.drag) {
      const dragPos = DrawArea.posFromEvent(event)

      if (target === 'position' && this.drag.closingPath) {
        if (dragPos.sub(this.drag.startPos).length() > snapDistance) {
          if (this.drag.closingInsertMode === 'prepend') {
            const index = state.nodes.length - 1
            state.nodes[index].type = 'symmetric'
            state.nodes[index] = PathUtil.moveHandle(state.nodes[index], 'handle1', DrawArea.posFromEvent(event))
          } else {
            const index = 0
            state.nodes[index].type = 'symmetric'
            state.nodes[index] = PathUtil.moveHandle(state.nodes[index], 'handle2', DrawArea.posFromEvent(event))
          }
        }
      } else {
        for (const [index, origNode] of this.drag.origNodes) {
          const pos = dragPos.add(origNode.position.sub(this.drag.draggedNodePos))
          state.nodes[index] = PathUtil.moveHandle(origNode, target, pos)
        }
      }
    }
  }

  onPointerMovePosition = (e: PointerEvent) => this.onPointerMove('position', e)
  onPointerMoveHandle1 = (e: PointerEvent) => this.onPointerMove('handle1', e)
  onPointerMoveHandle2 = (e: PointerEvent) => this.onPointerMove('handle2', e)

  @action onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    this.props.state.commit()
  }

  render () {
    const {state, index} = this.props
    const node = state.nodes[index]
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
}

class PathEditorBackground extends React.Component<{item: PathItem, width: number, height: number, state: PathEditorState}, {}> {
  dragStartPos = new Vec2()
  dragInsertMode: 'none'|'prepend'|'append' = 'none'

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
    this.dragInsertMode = this.props.state.insertMode
    this.dragStartPos = DrawArea.posFromEvent(event)
    if (this.props.state.insertMode !== 'none') {
      this.onInsertPointerDown(event)
    }
  }

  @action private onPointerMove = (event: PointerEvent) => {
    if (this.dragInsertMode !== 'none') {
      this.onInsertPointerDrag(event)
    } else if (this.props.state.insertMode !== 'none') {
      this.onInsertPointerHover(event)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.dragInsertMode = 'none'
    if (this.props.state.insertMode !== 'none') {
      this.onInsertPointerUp(event)
    }
  }

  @action private onInsertPointerDown = (event: PointerEvent) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    const {document} = this.props.item
    const {state} = this.props
    const pos = DrawArea.posFromEvent(event)
    const node: PathNode = {type: 'straight', position: pos, handle1: pos, handle2: pos}
    if (state.insertMode === 'prepend') {
      state.nodes.unshift(node)
      document.selectedPathNodes.replace([0])
    } else {
      state.nodes.push(node)
      document.selectedPathNodes.replace([state.nodes.length - 1])
    }
    state.insertPreview = undefined
  }

  @action private onInsertPointerDrag = (event: PointerEvent) => {
    const {state} = this.props
    const pos = DrawArea.posFromEvent(event)
    if (pos.sub(this.dragStartPos).length() <= snapDistance) {
      return
    }
    if (this.dragInsertMode === 'append') {
      const node = state.nodes[state.nodes.length - 1]
      if (node) {
        const newNode: PathNode = {
          type: 'symmetric',
          position: node.position,
          handle1: node.position.mulScalar(2).sub(pos),
          handle2: pos
        }
        state.nodes[state.nodes.length - 1] = newNode
      }
    } else {
      const node = state.nodes[0]
      if (node) {
        const newNode: PathNode = {
          type: 'symmetric',
          position: node.position,
          handle1: pos,
          handle2: node.position.mulScalar(2).sub(pos)
        }
        state.nodes[0] = newNode
      }
    }
  }

  @action private onInsertPointerHover = (event: PointerEvent) => {
    const {state} = this.props
    const pos = DrawArea.posFromEvent(event)
    const node: PathNode = {type: 'straight', position: pos, handle1: pos, handle2: pos}
    state.insertPreview = node
    state.closed = false
  }

  @action private onInsertPointerUp = (event: PointerEvent) => {
    this.props.state.commit()
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

@observer export class PathEditor extends React.Component<{item: PathItem, width: number, height: number}, {}> {
  state = new PathEditorState(this.props.item)

  componentWillUnmount () {
    this.state.dispose()
  }

  render () {
    const {item} = this.props
    const {scroll} = item.document

    return <g>
      <PathEditorBackground item={item} width={this.props.width} height={this.props.height} state={this.state} />
      <g transform={`translate(${-scroll.x}, ${-scroll.y})`}>
        {this.state.nodes.map((n, i) => <PathNodeHandle item={item} state={this.state} index={i} key={i} />)}
      </g>
    </g>
  }
}
