import * as React from 'react'
import { Vec2 } from 'paintvec'
import { action, observable, reaction, computed } from 'mobx'
import { observer } from 'mobx-react'
import { PathItem, PathNode, PathUtil, ItemChangeCommand, documentManager, ItemInsertCommand } from '../document'
import { DrawArea } from './DrawArea'
import { itemPreview } from './ItemPreview'
import { PointerEvents } from '../../util/components/PointerEvents'

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
  @observable item: PathItem|undefined
  readonly nodes = observable<PathNode>([])
  @observable closed: boolean
  @observable insertPreview: PathNode|undefined = undefined

  @computed get isOnlyFirstSelected () {
    const {selectedPathNodes} = documentManager.document
    return selectedPathNodes.size === 1 && selectedPathNodes.has(0)
  }
  @computed get isOnlyLastSelected () {
    const {selectedPathNodes} = documentManager.document
    return selectedPathNodes.size === 1 && selectedPathNodes.has(this.nodes.length - 1)
  }

  @computed get insertMode () {
    if (!this.item) {
      return 'none'
    }
    if (this.item.nodes.length === 0) {
      return 'prepend'
    }
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

  @observable private preview: PathItem|undefined
  private disposers: (() => void)[]

  @computed get itemNodes () {
    return this.item ? this.item.nodes.peek() : []
  }

  constructor () {
    this.disposers = [
      reaction(() => documentManager.document.focusedItem, item => {
        if (item instanceof PathItem && this.item !== item) {
          this.item = item
        }
      }),
      reaction(() => this.item, (item) => {
        if (item) {
          this.preview = itemPreview.addItem(item)
          normalizeNodes(this.preview)
          this.closed = this.preview.closed
        } else {
          itemPreview.clear()
        }
      }),
      reaction(() => this.closed, closed => {
        if (this.preview) {
          this.preview.closed = closed
        }
      }),
      reaction(() => this.itemNodes, nodes => {
        this.nodes.replace(nodes)
      }),
      reaction(() => [...this.nodesWithInsertPreview], nodes => {
        if (this.preview) {
          this.preview.nodes.replace(nodes)
        }
      })
    ]
  }

  dispose () {
    this.disposers.forEach(d => d())
    itemPreview.clear()
  }

  commit () {
    if (!this.item || !this.preview) {
      return
    }
    documentManager.document.history.push(new ItemChangeCommand('Move Path', this.item, {
      nodeArray: [...this.nodes],
      closed: this.preview.closed,
      offset: this.preview.offset,
      resizedSize: this.preview.resizedSize
    }))
  }

  insertItem () {
    const {document} = documentManager
    const item = new PathItem(document)
    item.name = 'Path'
    const parent = document.rootItem
    document.history.push(new ItemInsertCommand('Add Path', parent, item, parent.childAt(0)))
    document.focusedItem = item
    this.item = item
  }
}

@observer
class PathNodeHandle extends React.Component<{index: number, state: PathEditorState}, {}> {
  private drag: {
    origNodes: Map<number, PathNode>
    draggedNodePos: Vec2
  } | undefined = undefined
  private closingPathDrag: {
    startPos: Vec2
    insertMode: 'append' | 'prepend' | 'none'
  } | undefined = undefined

  private get closingPath () {
    const {state, index} = this.props
    if (!state.item || state.item.closed || state.item.nodes.length <= 1) {
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

  render () {
    const {state, index} = this.props
    const node = state.nodes[index]
    const p = node.position
    const h1 = node.handle1
    const h2 = node.handle2
    const selected = documentManager.document.selectedPathNodes.has(index)

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

    if (target === 'position' && this.closingPath) {
      this.closingPathDrag = {
        startPos: DrawArea.posFromEvent(event),
        insertMode: this.props.state.insertMode
      }
    } else {
      const {index, state} = this.props
      const origNodes = new Map<number, PathNode>()
      if (target === 'position') {
        const {document} = documentManager
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
      this.drag = {origNodes, draggedNodePos: state.nodes[index].position}
    }
  }

  private onPointerDownPosition = (e: PointerEvent) => this.onPointerDown('position', e)
  private onPointerDownHandle1 = (e: PointerEvent) => this.onPointerDown('handle1', e)
  private onPointerDownHandle2 = (e: PointerEvent) => this.onPointerDown('handle2', e)

  @action private onPointerMove = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    const {state} = this.props
    if (target === 'position' && this.closingPath) {
      state.closed = true
    } else {
      state.insertPreview = undefined
    }

    const dragPos = DrawArea.posFromEvent(event)

    if (this.closingPathDrag) {
      if (dragPos.sub(this.closingPathDrag.startPos).length() > snapDistance) {
        if (this.closingPathDrag.insertMode === 'prepend') {
          const index = state.nodes.length - 1
          state.nodes[index].type = 'symmetric'
          state.nodes[index] = PathUtil.moveHandle(state.nodes[index], 'handle1', DrawArea.posFromEvent(event))
        } else {
          const index = 0
          state.nodes[index].type = 'symmetric'
          state.nodes[index] = PathUtil.moveHandle(state.nodes[index], 'handle2', DrawArea.posFromEvent(event))
        }
      }
    }

    if (this.drag) {
      for (const [index, origNode] of this.drag.origNodes) {
        const pos = dragPos.add(origNode.position.sub(this.drag.draggedNodePos))
        state.nodes[index] = PathUtil.moveHandle(origNode, target, pos)
      }
    }
  }

  private onPointerMovePosition = (e: PointerEvent) => this.onPointerMove('position', e)
  private onPointerMoveHandle1 = (e: PointerEvent) => this.onPointerMove('handle1', e)
  private onPointerMoveHandle2 = (e: PointerEvent) => this.onPointerMove('handle2', e)

  @action private onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    this.closingPathDrag = undefined
    this.props.state.commit()
  }
}

class PathEditorBackground extends React.Component<{width: number, height: number, state: PathEditorState}, {}> {
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
    const {state} = this.props
    if (!state.item) {
      state.insertItem()
    }
    this.dragInsertMode = state.insertMode
    this.dragStartPos = DrawArea.posFromEvent(event)
    if (state.insertMode !== 'none') {
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
    const {state} = this.props
    const {document} = documentManager
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
    documentManager.document.selectedPathNodes.clear()
  }

  @action private onDoubleClick = () => {
    documentManager.document.focusedItem = undefined
  }
}

@observer export class PathEditor extends React.Component<{width: number, height: number}, {}> {
  state = new PathEditorState()

  componentWillUnmount () {
    this.state.dispose()
  }

  render () {
    const {scroll} = documentManager.document

    return <g>
      <PathEditorBackground width={this.props.width} height={this.props.height} state={this.state} />
      {this.state.item && <g transform={`translate(${-scroll.x}, ${-scroll.y})`}>
        {this.state.nodes.map((n, i) => <PathNodeHandle state={this.state} index={i} key={i} />)}
      </g>}
    </g>
  }
}
