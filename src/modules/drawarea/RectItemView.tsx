import * as React from 'react'
import { observer } from 'mobx-react'
import { RectItem } from '../document'
import { Movable } from './Movable'

@observer
export class RectItemView extends React.Component<{item: RectItem}, {}> {
  render () {
    const {item} = this.props
    const {x, y} = item.position
    const {width, height} = item.size
    const fill = item.fillEnabled ? item.fill : 'none'
    const stroke = item.strokeEnabled ? item.stroke : 'none'
    const {radius} = item
    return <Movable item={item} key={item.id}>
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={item.strokeWidth}
        rx={radius} ry={radius}
      />
    </Movable>
  }
}
