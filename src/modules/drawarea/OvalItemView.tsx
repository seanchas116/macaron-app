import * as React from 'react'
import { observer } from 'mobx-react'
import { OvalItem } from '../document'
import { Movable } from './Movable'

@observer
export class OvalItemView extends React.Component<{item: OvalItem}, {}> {
  render () {
    const {item} = this.props
    const center = item.rect.center
    const radius = item.rect.size.mulScalar(0.5)
    const fill = item.fillEnabled ? item.fill : 'none'
    const stroke = item.strokeEnabled ? item.stroke : 'none'
    return <Movable item={item} key={item.id}>
      <ellipse
        cx={center.x} cy={center.y} rx={radius.x} ry={radius.y}
        fill={fill}
        stroke={stroke}
        strokeWidth={item.strokeWidth}
      />
    </Movable>
  }
}
