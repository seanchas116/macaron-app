import * as React from 'react'
import {OvalItem} from '../document/OvalItem'
import {Movable} from './Movable'

export class OvalItemView extends React.Component<{item: OvalItem}, {}> {
  render () {
    const {item} = this.props
    const center = item.rect.center
    const radius = item.rect.size.mulScalar(0.5)
    return <Movable item={item} key={item.id}>
      <ellipse
        cx={center.x} cy={center.y} rx={radius.x} ry={radius.y}
        fill={item.fill}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
      />
    </Movable>
  }
}
