import * as React from 'react'
import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'
import {Movable} from '../drawarea/Movable'

export interface OvalItemProps extends RectLikeItemProps {
  type: 'oval'
}

export
class OvalItem extends RectLikeItem {
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
    return new OvalItem(this.document, this.toProps())
  }

  toProps (): OvalItemProps {
    return {
      ...super.toProps(),
      type: 'oval'
    }
  }
}
