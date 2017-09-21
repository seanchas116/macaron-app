import { Vec2, Rect } from 'paintvec'
import { ItemComponent } from './Item'

export interface ShapeData {
  type: string
}

export abstract class Shape extends ItemComponent {
  abstract position: Vec2
  abstract size: Vec2

  get rect () {
    return Rect.fromSize(this.position, this.size)
  }
  set rect (rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  abstract toData (): ShapeData
  abstract loadData (data: ShapeData): void
}
