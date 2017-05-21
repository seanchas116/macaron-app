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
  hx1: number
  hy1: number
  hx2: number
  hy2: number
  type: PathNodeType
}

export interface PathItemData extends ItemData {
  type: 'path'
  nodes: PathNodeData[]
}

export class PathItem extends Item {
  readonly nodes = observable<PathNode>([])
  @observable offset = new Vec2()

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

    for (let i = 1; i < nodes.length; ++i) {
      const node = nodes[i]
      const prevNode = nodes[i - 1]
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
    this.nodes.replace(data.nodes.map(e => {
      const node: PathNode = {
        position: new Vec2(e.x, e.y),
        handles: [new Vec2(e.hx1, e.hy1), new Vec2(e.hx2, e.hy2)],
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
        hx1: e.handles[0].x,
        hy1: e.handles[0].y,
        hx2: e.handles[1].x,
        hy2: e.handles[1].y,
        type: e.type
      }
      return data
    })

    return {
      ...super.toData(),
      type: 'path',
      nodes
    }
  }

  toSVGPathData () {
    const {x: dx, y: dy} = this.offset
    const {nodes} = this
    const commands = [`M ${nodes[0].position.x + dx} ${nodes[0].position.y + dy}`]
    for (let i = 1; i < nodes.length; ++i) {
      const node = nodes[i]
      const prevNode = nodes[i - 1]
      const {x, y} = node.position
      if (node.type === 'straight' && prevNode.type === 'straight') {
        commands.push(`L ${x + dx} ${y + dy}`)
      } else {
        const {x: x1, y: y1} = prevNode.handles[1]
        const {x: x2, y: y2} = node.handles[0]
        commands.push(`C ${x1 + dx} ${y1 + dy}, ${x2 + dx} ${y2 + dy}, ${x + dx} ${y + dy}`)
      }
    }
    return commands.join(' ')
  }
}
