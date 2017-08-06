import * as React from 'react'
import { Vec2 } from 'paintvec'
import { action, observable, reaction, computed, IObservableArray } from 'mobx'
import { observer } from 'mobx-react'
import { Item, PathItem, PathNode, PathUtil, ItemChangeCommand, documentManager, Document, ItemInsertCommand } from '../document'
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
  @observable targetState: PathEditorTargetState|undefined = undefined
  private disposers: (() => void)[]

  constructor (public document: Document) {
    this.disposers = [
      reaction(() => document.focusedItem, item => this.onFocusedItemChange(item))
    ]
  }

  dispose () {
    if (this.targetState) {
      this.targetState.dispose()
    }
  }

  insertItem () {
    const {document} = this
    const item = new PathItem(document)
    item.name = 'Path'
    const parent = document.rootItem
    document.history.push(new ItemInsertCommand('Add Path', parent, item, parent.childAt(0)))
    document.focusedItem = item
    this.onFocusedItemChange(item)
  }

  @action private onFocusedItemChange (item: Item|undefined) {
    if (this.targetState) {
      if (this.targetState.item === item) {
        return
      }
      this.targetState.dispose()
      this.targetState = undefined
    }
    if (item && item instanceof PathItem) {
      this.targetState = new PathEditorTargetState(item)
    }
  }
}

class PathEditorTargetState {
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
class PathNodeHandle extends React.Component<{index: number, targetState: PathEditorTargetState}, {}> {
  private drag: {
    origNodes: Map<number, PathNode>
    draggedNodePos: Vec2
  } | undefined = undefined
  private closingPathDrag: {
    startPos: Vec2
    insertMode: 'append' | 'prepend' | 'none'
  } | undefined = undefined

  private get closingPath () {
    const {targetState, index} = this.props
    if (targetState.item.closed || targetState.item.nodes.length <= 1) {
      return false
    }
    if (targetState.isOnlyFirstSelected) {
      return index === targetState.nodes.length - 1
    }
    if (targetState.isOnlyLastSelected) {
      return index === 0
    }
    return false
  }

  render () {
    const {targetState, index} = this.props
    const node = targetState.nodes[index]
    const p = node.position
    const h1 = node.handle1
    const h2 = node.handle2
    const selected = targetState.item.document.selectedPathNodes.has(index)

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
        insertMode: this.props.targetState.insertMode
      }
    } else {
      const {index, targetState} = this.props
      const origNodes = new Map<number, PathNode>()
      if (target === 'position') {
        const {document} = targetState.item
        if (event.shiftKey) {
          document.selectedPathNodes.add(index)
        } else if (!document.selectedPathNodes.has(index)) {
          document.selectedPathNodes.replace([index])
        }
        for (const i of document.selectedPathNodes) {
          origNodes.set(i , {...targetState.nodes[i]})
        }
      } else {
        origNodes.set(index, {...targetState.nodes[index]})
      }
      this.drag = {origNodes, draggedNodePos: targetState.nodes[index].position}
    }
  }

  private onPointerDownPosition = (e: PointerEvent) => this.onPointerDown('position', e)
  private onPointerDownHandle1 = (e: PointerEvent) => this.onPointerDown('handle1', e)
  private onPointerDownHandle2 = (e: PointerEvent) => this.onPointerDown('handle2', e)

  @action private onPointerMove = (target: 'position' | 'handle1' | 'handle2', event: PointerEvent) => {
    const {targetState} = this.props
    if (target === 'position' && this.closingPath) {
      targetState.closed = true
    } else {
      targetState.insertPreview = undefined
    }

    const dragPos = DrawArea.posFromEvent(event)

    if (this.closingPathDrag) {
      if (dragPos.sub(this.closingPathDrag.startPos).length() > snapDistance) {
        if (this.closingPathDrag.insertMode === 'prepend') {
          const index = targetState.nodes.length - 1
          targetState.nodes[index].type = 'symmetric'
          targetState.nodes[index] = PathUtil.moveHandle(targetState.nodes[index], 'handle1', DrawArea.posFromEvent(event))
        } else {
          const index = 0
          targetState.nodes[index].type = 'symmetric'
          targetState.nodes[index] = PathUtil.moveHandle(targetState.nodes[index], 'handle2', DrawArea.posFromEvent(event))
        }
      }
    }

    if (this.drag) {
      for (const [index, origNode] of this.drag.origNodes) {
        const pos = dragPos.add(origNode.position.sub(this.drag.draggedNodePos))
        targetState.nodes[index] = PathUtil.moveHandle(origNode, target, pos)
      }
    }
  }

  private onPointerMovePosition = (e: PointerEvent) => this.onPointerMove('position', e)
  private onPointerMoveHandle1 = (e: PointerEvent) => this.onPointerMove('handle1', e)
  private onPointerMoveHandle2 = (e: PointerEvent) => this.onPointerMove('handle2', e)

  @action private onPointerUp = (event: PointerEvent) => {
    this.drag = undefined
    this.closingPathDrag = undefined
    this.props.targetState.commit()
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
    if (!this.props.state.targetState) {
      this.props.state.insertItem()
    }
    const {targetState} = this.props.state
    if (!targetState) {
      return
    }
    this.dragInsertMode = targetState.insertMode
    this.dragStartPos = DrawArea.posFromEvent(event)
    if (targetState.insertMode !== 'none') {
      this.onInsertPointerDown(targetState, event)
    }
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const {targetState} = this.props.state
    if (!targetState) {
      return
    }
    if (this.dragInsertMode !== 'none') {
      this.onInsertPointerDrag(targetState, event)
    } else if (targetState.insertMode !== 'none') {
      this.onInsertPointerHover(targetState, event)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.dragInsertMode = 'none'
    const {targetState} = this.props.state
    if (!targetState) {
      return
    }
    if (targetState.insertMode !== 'none') {
      this.onInsertPointerUp(targetState, event)
    }
  }

  @action private onInsertPointerDown = (targetState: PathEditorTargetState, event: PointerEvent) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    const {document} = targetState.item
    const pos = DrawArea.posFromEvent(event)
    const node: PathNode = {type: 'straight', position: pos, handle1: pos, handle2: pos}
    if (targetState.insertMode === 'prepend') {
      targetState.nodes.unshift(node)
      document.selectedPathNodes.replace([0])
    } else {
      targetState.nodes.push(node)
      document.selectedPathNodes.replace([targetState.nodes.length - 1])
    }
    targetState.insertPreview = undefined
  }

  @action private onInsertPointerDrag = (targetState: PathEditorTargetState, event: PointerEvent) => {
    const pos = DrawArea.posFromEvent(event)
    if (pos.sub(this.dragStartPos).length() <= snapDistance) {
      return
    }
    if (this.dragInsertMode === 'append') {
      const node = targetState.nodes[targetState.nodes.length - 1]
      if (node) {
        const newNode: PathNode = {
          type: 'symmetric',
          position: node.position,
          handle1: node.position.mulScalar(2).sub(pos),
          handle2: pos
        }
        targetState.nodes[targetState.nodes.length - 1] = newNode
      }
    } else {
      const node = targetState.nodes[0]
      if (node) {
        const newNode: PathNode = {
          type: 'symmetric',
          position: node.position,
          handle1: pos,
          handle2: node.position.mulScalar(2).sub(pos)
        }
        targetState.nodes[0] = newNode
      }
    }
  }

  @action private onInsertPointerHover = (targetState: PathEditorTargetState, event: PointerEvent) => {
    const pos = DrawArea.posFromEvent(event)
    const node: PathNode = {type: 'straight', position: pos, handle1: pos, handle2: pos}
    targetState.insertPreview = node
    targetState.closed = false
  }

  @action private onInsertPointerUp = (targetState: PathEditorTargetState, event: PointerEvent) => {
    targetState.commit()
  }

  @action private onClick = () => {
    const {document} = this.props.state
    document.selectedPathNodes.clear()
  }

  @action private onDoubleClick = () => {
    const {document} = this.props.state
    document.focusedItem = undefined
  }
}

@observer export class PathEditor extends React.Component<{width: number, height: number}, {}> {
  state = new PathEditorState(documentManager.document)

  componentWillUnmount () {
    this.state.dispose()
  }

  render () {
    const {targetState} = this.state
    const {scroll} = this.state.document

    return <g>
      <PathEditorBackground width={this.props.width} height={this.props.height} state={this.state} />
      {targetState && <g transform={`translate(${-scroll.x}, ${-scroll.y})`}>
        {targetState.nodes.map((n, i) => <PathNodeHandle targetState={targetState} index={i} key={i} />)}
      </g>}
    </g>
  }
}
