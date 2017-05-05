import * as React from 'react'
import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'
import {Movable} from '../drawarea/Movable'

export interface RectItemProps extends RectLikeItemProps {
  type: 'rect'
}

export
class RectItem extends RectLikeItem {
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
    return new RectItem(this.document, this.toProps())
  }

  toProps(): RectItemProps {
    return {
      ...super.toProps(),
      type: 'rect'
    }
  }
}
