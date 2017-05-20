import {observable, computed} from 'mobx'
import {Vec2, Rect} from 'paintvec'
import {Item, ItemData} from './Item'

export type PathEdgeType = 'symmetric' | 'asymmetric' | 'disconnected' | 'straight'

export interface PathEdge {
  position: Vec2
  handles: [Vec2, Vec2]
  type: PathEdgeType
}

export interface PathEdgeData {
  x: number
  y: number
  hx1: number
  hy1: number
  hx2: number
  hy2: number
  type: PathEdgeType
}

export interface PathItemData extends ItemData {
  type: 'path'
  edges: PathEdgeData[]
}

export class PathItem extends Item {
  readonly edges = observable<PathEdge>([])
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
    // TODO: improve algorithm
    const points = this.edges.map(e => e.position)
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    return new Rect(
      new Vec2(Math.min(...xs), Math.min(...ys)),
      new Vec2(Math.max(...xs), Math.max(...ys))
    )
  }

  clone () {
    const item = new PathItem(this.document)
    item.loadData(this.toData())
    return item
  }

  loadData (data: PathItemData) {
    super.loadData(data)
    this.edges.replace(data.edges.map(e => {
      const edge: PathEdge = {
        position: new Vec2(e.x, e.y),
        handles: [new Vec2(e.hx1, e.hy1), new Vec2(e.hx2, e.hy2)],
        type: e.type
      }
      return edge
    }))
  }

  toData (): PathItemData {
    const edges = this.edges.map(e => {
      const data: PathEdgeData = {
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
      edges
    }
  }

  toSVGPathData () {
    const {x: dx, y: dy} = this.offset
    const {edges} = this
    const commands = [`M ${edges[0].position.x + dx} ${edges[0].position.y + dy}`]
    for (let i = 1; i < edges.length; ++i) {
      const edge = edges[i]
      const {x, y} = edge.position
      if (edge.type === 'straight') {
        commands.push(`L ${x + dx} ${y + dy}`)
      } else {
        const {x: x1, y: y1} = edges[i - 1].handles[1]
        const {x: x2, y: y2} = edges[i].handles[0]
        commands.push(`C ${x1 + dx} ${y1 + dy}, ${x2 + dx} ${y2 + dy}, ${x + dx} ${y + dy}`)
      }
    }
    return commands.join(' ')
  }
}
