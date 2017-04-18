import * as React from 'react'
import {Rect} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'

export
class OvalItem extends Item {
  @observable rect = new Rect()

  render () {
    const center = this.rect.center
    const radius = this.rect.size.mulScalar(0.5)
    return <ellipse
      key={this.id}
      cx={center.x} cy={center.y} rx={radius.x} ry={radius.y}
      fill={this.fill}
      stroke={this.stroke}
      strokeWidth={this.strokeWidth}
    />
  }
}
