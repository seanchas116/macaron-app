import * as React from 'react'
import {RectLikeItem, RectLikeItemData} from './RectLikeItem'
import {Movable} from '../drawarea/Movable'

export interface OvalItemData extends RectLikeItemData {
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
    return new OvalItem(this.document, this.toData())
  }

  toData (): OvalItemData {
    return {
      ...super.toData(),
      type: 'oval'
    }
  }
}
