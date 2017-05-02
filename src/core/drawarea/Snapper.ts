import {Vec2, Rect} from 'paintvec'
import {observable, computed, action} from 'mobx'
import {Arrangement, Direction} from '../../util/types'

const snapDistance = 8

interface RectSnapping {
  direction: Direction
  target: Rect
  targetValue: number
  targetAt: Arrangement
  self: Rect
  selfValue: number
  selfAt: Arrangement
}

function edges (rect: Rect, direction: Direction): {value: number, at: Arrangement}[] {
  const begin = direction === 'horizontal' ? rect.left : rect.top
  const end = direction === 'horizontal' ? rect.right : rect.bottom
  const center = (begin + end) / 2
  return [
    {value: begin, at: 'begin'},
    {value: center, at: 'center'},
    {value: end, at: 'end'}
  ]
}

function snapRect (targets: Rect[], self: Rect, direction: Direction) {
  const snappings: RectSnapping[] = []

  const selfEdges = edges(self, direction)

  for (const target of targets) {
    const targetEdges = edges(target, direction)
    for (const {value: selfValue, at: selfAt} of selfEdges) {
      for (const {value: targetValue, at: targetAt} of targetEdges) {
        snappings.push({
          direction,
          target,
          targetValue,
          targetAt,
          self,
          selfValue,
          selfAt
        })
      }
    }
  }

  const minDistance = Math.min(...snappings.map(s => Math.abs(s.selfValue - s.targetValue)))
  if (minDistance > snapDistance) {
    return []
  }

  return snappings.filter(s => Math.abs(s.selfValue - s.targetValue) === minDistance)
}

function snapLine (snapping: RectSnapping): [Vec2, Vec2] {
  const {target, self} = snapping
  if (snapping.direction === 'horizontal') {
    const x = snapping.targetValue
    const ys = [
      target.top,
      target.bottom,
      self.top,
      self.bottom
    ]
    const y0 = Math.min(...ys)
    const y1 = Math.max(...ys)
    return [new Vec2(x, y0), new Vec2(x, y1)]
  } else {
    const y = snapping.targetValue
    const xs = [
      target.left,
      target.right,
      self.left,
      self.right
    ]
    const x0 = Math.min(...xs)
    const x1 = Math.max(...xs)
    return [new Vec2(x0, y), new Vec2(x1, y)]
  }
}

export class Snapper {
  targets: Rect[] = []
  readonly snappings = observable<RectSnapping>([])

  @computed get snapLines () {
    return this.snappings.map(snapLine)
  }

  @action snapRect (rect: Rect) {
    const xSnappings = snapRect(this.targets, rect, 'horizontal')
    const xOffset = xSnappings.length > 0 ? xSnappings[0].targetValue - xSnappings[0].selfValue : 0
    const ySnappings = snapRect(this.targets, rect, 'vertical')
    const yOffset = ySnappings.length > 0 ? ySnappings[0].targetValue - ySnappings[0].selfValue : 0
    this.snappings.replace([...xSnappings, ...ySnappings])
    return new Vec2(xOffset, yOffset)
  }

  @action clear () {
    this.snappings.clear()
  }
}

export const snapper = new Snapper()
