import {observable, computed} from 'mobx'
import {Vec2, Rect} from 'paintvec'
const Bezier = require('bezier-js')
import {Item, ItemData} from './Item'

export type PathNodeType = 'symmetric' | 'asymmetric' | 'disconnected' | 'straight'

export interface PathNode {
  position: Vec2
  handles: [Vec2, Vec2]
  type: PathNodeType
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
  closed: boolean
  nodes: PathNodeData[]
}

export class PathItem extends Item {
  readonly nodes = observable<PathNode>([])
  @observable offset = new Vec2()
  @observable closed = false

  get position () {
    return this.boundingRect.topLeft.add(this.offset)
  }
  set position (pos: Vec2) {
    this.offset = pos.sub(this.boundingRect.topLeft)
  }

  get size () {
    return this.boundingRect.size
  }

  @computed get boundingRect () {
    const {nodes} = this
    let result: Rect|undefined

    const addCurve = (prevNode: PathNode, node: PathNode) => {
      const curve = new Bezier(
        prevNode.position.x, prevNode.position.y,
        prevNode.handles[1].x, prevNode.handles[1].y,
        node.handles[0].x, node.handles[0].y,
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
    this.closed = data.closed
    this.nodes.replace(data.nodes.map(e => {
      const node: PathNode = {
        position: new Vec2(e.x, e.y),
        handles: [new Vec2(e.handle1X, e.handle1Y), new Vec2(e.handle2X, e.handle2Y)],
        type: e.type
      }
      return node
    }))
  }

  toData (): PathItemData {
    const nodes = this.nodes.map(e => {
      const data: PathNodeData = {
        x: e.position.x,
        y: e.position.y,
        handle1X: e.handles[0].x,
        handle1Y: e.handles[0].y,
        handle2X: e.handles[1].x,
        handle2Y: e.handles[1].y,
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
      closed,
      nodes
    }
  }

  toSVGPathData () {
    const {x: dx, y: dy} = this.offset
    const {nodes} = this
    const start = nodes[0].position
    const commands = [`M ${start.x + dx} ${start.y + dy}`]

    const addCurve = (prevNode: PathNode, node: PathNode) => {
      const {x, y} = node.position
      if (node.type === 'straight' && prevNode.type === 'straight') {
        commands.push(`L ${x + dx} ${y + dy}`)
      } else {
        const {x: x1, y: y1} = prevNode.handles[1]
        const {x: x2, y: y2} = node.handles[0]
        commands.push(`C ${x1 + dx} ${y1 + dy}, ${x2 + dx} ${y2 + dy}, ${x + dx} ${y + dy}`)
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
}
