import {observable, computed} from 'mobx'
import {Vec2, Rect} from 'paintvec'
const Bezier = require('bezier-js')
import {Item, ItemData} from './Item'

export type PathNodeType = 'symmetric' | 'asymmetric' | 'disconnected' | 'straight'

export interface PathNode {
  type: PathNodeType
  position: Vec2
  handle1: Vec2
  handle2: Vec2
}

export interface PathNodeData {
  x: number
  y: number
  handle1X: number
  handle1Y: number
  handle2X: number
  handle2Y: number
  type: PathNodeType
}

export interface PathItemData extends ItemData {
  type: 'path'
  offsetX: number
  offsetY: number
  resizedWidth: number|null
  resizedHeight: number|null
  closed: boolean
  nodes: PathNodeData[]
}

export class PathItem extends Item {
  readonly nodes = observable<PathNode>([])
  @observable offset = new Vec2()
  @observable closed = false
  @observable resizedSize: Vec2|undefined

  // nodes as settable immutable array property
  get nodeArray (): ReadonlyArray<PathNode> {
    return [...this.nodes]
  }
  set nodeArray (array: ReadonlyArray<PathNode>) {
    this.nodes.replace(array as PathNode[])
  }

  @computed get position () {
    return this.boundingRect.topLeft.add(this.offset)
  }
  set position (pos: Vec2) {
    this.offset = pos.sub(this.boundingRect.topLeft)
  }

  @computed get size () {
    return this.resizedSize || this.boundingRect.size
  }
  set size (size: Vec2) {
    this.resizedSize = size
  }

  @computed get boundingRect () {
    const {nodes} = this
    let result: Rect|undefined

    const addCurve = (prevNode: PathNode, node: PathNode) => {
      const curve = new Bezier(
        prevNode.position.x, prevNode.position.y,
        prevNode.handle2.x, prevNode.handle2.y,
        node.handle1.x, node.handle1.y,
        node.position.x, node.position.y
      )
      const bbox = curve.bbox()
      const rect = new Rect(
        new Vec2(bbox.x.min, bbox.y.min),
        new Vec2(bbox.x.max, bbox.y.max)
      )
      result = result ? result.union(rect) : rect
    }

    for (let i = 1; i < nodes.length; ++i) {
      addCurve(nodes[i - 1], nodes[i])
    }
    if (this.closed && 2 <= this.nodes.length) {
      addCurve(nodes[nodes.length - 1], nodes[0])
    }
    if (result && this.strokeEnabled) {
      result = result.inflate(this.strokeWidth * 0.5)
    }
    return result || new Rect()
  }

  clone () {
    const item = new PathItem(this.document)
    item.loadData(this.toData())
    return item
  }

  loadData (data: PathItemData) {
    super.loadData(data)
    this.offset = new Vec2(data.offsetX, data.offsetY)
    this.resizedSize = (data.resizedWidth && data.resizedHeight) ? new Vec2(data.resizedWidth, data.resizedHeight) : undefined
    this.closed = data.closed
    this.nodes.replace(data.nodes.map(e => ({
      type: e.type,
      position: new Vec2(e.x, e.y),
      handle1: new Vec2(e.handle1X, e.handle1Y),
      handle2: new Vec2(e.handle2X, e.handle2Y)
    })))
  }

  toData (): PathItemData {
    const nodes = this.nodes.map(e => {
      const data: PathNodeData = {
        x: e.position.x,
        y: e.position.y,
        handle1X: e.handle1.x,
        handle1Y: e.handle1.y,
        handle2X: e.handle2.x,
        handle2Y: e.handle2.y,
        type: e.type
      }
      return data
    })
    const {closed} = this

    return {
      ...super.toData(),
      type: 'path',
      offsetX: this.offset.x,
      offsetY: this.offset.y,
      resizedWidth: this.resizedSize ? this.resizedSize.x : null,
      resizedHeight: this.resizedSize ? this.resizedSize.y : null,
      closed,
      nodes
    }
  }

  @computed get svgPathData () {
    const {nodes} = this
    if (nodes.length < 2) {
      return ''
    }

    const start = this.transformPos(nodes[0].position)
    const commands = [`M ${start.x} ${start.y}`]

    const addCurve = (prevNode: PathNode, node: PathNode) => {
      const {x, y} = this.transformPos(node.position)
      if (node.type === 'straight' && prevNode.type === 'straight') {
        commands.push(`L ${x} ${y}`)
      } else {
        const {x: x1, y: y1} = this.transformPos(prevNode.handle2)
        const {x: x2, y: y2} = this.transformPos(node.handle1)
        commands.push(`C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`)
      }
    }

    for (let i = 1; i < nodes.length; ++i) {
      addCurve(nodes[i - 1], nodes[i])
    }
    if (this.closed && 2 <= nodes.length) {
      addCurve(nodes[nodes.length - 1], nodes[0])
    }
    return commands.join(' ')
  }

  transformPos (pos: Vec2) {
    if (this.resizedSize) {
      return pos.sub(this.boundingRect.topLeft)
              .mul(this.resizedSize.div(this.boundingRect.size))
              .add(this.boundingRect.topLeft)
              .add(this.offset)
    } else {
      return pos.add(this.offset)
    }
  }
}
