import {Vec2, Rect} from 'paintvec'
import {observable, computed, action} from 'mobx'
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

function edges (item: Item, pos: Vec2, direction: Direction): {value: number, at: Arrangement}[] {
  const rect = Rect.fromSize(pos, item.size)
  const begin = direction === 'horizontal' ? rect.left : rect.top
  const end = direction === 'horizontal' ? rect.right : rect.bottom
  const center = (begin + end) / 2
  return [
    {value: begin, at: 'begin'},
    {value: center, at: 'center'},
    {value: end, at: 'end'}
  ]
}

function snapRect (targets: Item[], self: Item, selfPos: Vec2, direction: Direction) {
  const snappings: RectSnapping[] = []

  const selfEdges = edges(self, selfPos, direction)

  for (const target of targets) {
    const targetEdges = edges(target, target.rect.topLeft, direction)
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
    const y1 = Math.max(...ys)
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
    const x1 = Math.max(...xs)
    return [new Vec2(x0, y), new Vec2(x1, y)]
  }
}

export class Snapper {
  @observable item: Item|undefined
  readonly targetItems = observable<Item>([])
  readonly snappings = observable<RectSnapping>([])

  @computed get snapLines () {
    return this.snappings.map(snapLine)
  }

  /**
   * @return The snapped position of item
   */
  @action snap (item: Item, itemPos: Vec2) {
    this.item = item
    const xSnappings = snapRect(this.targetItems, item, itemPos, 'horizontal')
    const xOffset = xSnappings.length > 0 ? xSnappings[0].targetValue - xSnappings[0].selfValue : 0
    const ySnappings = snapRect(this.targetItems, item, itemPos, 'vertical')
    const yOffset = ySnappings.length > 0 ? ySnappings[0].targetValue - ySnappings[0].selfValue : 0
    this.snappings.replace([...xSnappings, ...ySnappings])
    return itemPos.add(new Vec2(xOffset, yOffset))
  }

  @action clear () {
    this.item = undefined
    this.targetItems.clear()
    this.snappings.clear()
  }
}

export const snapper = new Snapper()
