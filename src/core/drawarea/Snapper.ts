import {Vec2} from 'paintvec'
import {observable, computed} from 'mobx'
import {Item} from '../items/Item'
import {Arrangement, Direction} from '../../util/types'

const snapDistance = 8

interface RectSnapping {
  direction: Direction
  target: Item
  targetValue: number
  targetAt: Arrangement
  self: Item
  selfValue: number
  selfAt: Arrangement
}

function edges (item: Item, direction: Direction): {value: number, at: Arrangement}[] {
  const begin = direction === 'horizontal' ? item.rect.left : item.rect.top
  const end = direction === 'horizontal' ? item.rect.right : item.rect.bottom
  const center = (begin + end) / 2
  return [
    {value: begin, at: 'begin'},
    {value: center, at: 'center'},
    {value: end, at: 'end'}
  ]
}

function snapRect (targets: Item[], self: Item, direction: Direction) {
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
      target.rect.top,
      target.rect.bottom,
      self.rect.top,
      self.rect.bottom
    ]
    const y0 = Math.min(...ys)
    const y1 = Math.min(...ys)
    return [new Vec2(x, y0), new Vec2(x, y1)]
  } else {
    const y = snapping.targetValue
    const xs = [
      target.rect.left,
      target.rect.right,
      self.rect.left,
      self.rect.right
    ]
    const x0 = Math.min(...xs)
    const x1 = Math.min(...xs)
    return [new Vec2(x0, y), new Vec2(x1, y)]
  }
}

export class Snapper {
  @observable item: Item|undefined
  readonly targetItems = observable<Item>([])

  @computed get snappings () {
    const {item, targetItems} = this
    return [...snapRect(targetItems, item, 'horizontal'), ...snapRect(targetItems, item, 'vertical')]
  }

  @computed get snapLines () {
    return this.snappings.map(snapLine)
  }
}
