import * as React from 'react'
import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {Movable} from './components/Movable'

export
class RectItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Rectangle'

  render (): JSX.Element {
    const {x, y} = this.position
    const {width, height} = this.size
    return <Movable item={this} key={this.id}>
      <rect
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
