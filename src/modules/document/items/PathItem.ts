import {observable} from 'mobx'
import {Vec2} from 'paintvec'
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

  get position () {
    // TODO
    return new Vec2()
  }
  get size () {
    // TODO
    return new Vec2()
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
}
