import { Vec2, Rect } from 'paintvec'

export abstract class Shape {
  abstract position: Vec2
  abstract size: Vec2

  get rect () {
    return Rect.fromSize(this.position, this.size)
  }
  set rect (rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }
}
