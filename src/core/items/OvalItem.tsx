import * as React from 'react'
import {Rect, Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {Movable} from './components/Movable'

export
class OvalItem extends Item {
  @observable size = new Vec2()
  name = 'Oval'

  get rect() {
    return Rect.fromSize(this.position, this.size)
  }
  set rect(rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  render (): JSX.Element {
    const center = this.rect.center
    const radius = this.rect.size.mulScalar(0.5)
    return <Movable item={this}>
      <ellipse
        key={this.id}
        cx={center.x} cy={center.y} rx={radius.x} ry={radius.y}
        fill={this.fill}
        stroke={this.stroke}
        strokeWidth={this.strokeWidth}
      />
    </Movable>
  }

  clone () {
    const cloned = new OvalItem(this.document)
    this.copyPropsFrom(cloned)
    return cloned
  }

  copyPropsFrom (other: OvalItem) {
    super.copyPropsFrom(other)
    other.size = this.size
  }
}
