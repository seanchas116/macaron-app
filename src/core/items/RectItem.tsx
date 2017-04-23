import * as React from 'react'
import {Rect, Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {Movable} from './components/Movable'

export
class RectItem extends Item {
  @observable size = new Vec2()
  name = 'Rectangle'

  get rect() {
    return Rect.fromSize(this.position, this.size)
  }
  set rect(rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  render (): JSX.Element {
    const {x, y} = this.position
    const {width, height} = this.size
    return <Movable item={this}>
      <rect
        key={this.id}
        x={x} y={y} width={width} height={height}
        fill={this.fill}
        stroke={this.stroke}
        strokeWidth={this.strokeWidth}
      />
    </Movable>
  }

  clone () {
    const cloned = new RectItem(this.document)
    this.copyPropsFrom(cloned)
    return cloned
  }

  copyPropsFrom (other: RectItem) {
    super.copyPropsFrom(other)
    other.size = this.size
  }
}
