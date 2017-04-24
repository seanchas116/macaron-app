import * as React from 'react'
import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {Movable} from '../drawarea/Movable'

export
class OvalItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Oval'

  render (): JSX.Element {
    const center = this.rect.center
    const radius = this.rect.size.mulScalar(0.5)
    return <Movable item={this} key={this.id}>
      <ellipse
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
