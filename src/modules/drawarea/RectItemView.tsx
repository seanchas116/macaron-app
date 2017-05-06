import * as React from 'react'
import {observer} from 'mobx-react'
import {RectItem} from '../document/RectItem'
import {Movable} from './Movable'

@observer
export class RectItemView extends React.Component<{item: RectItem}, {}> {
  render () {
    const {item} = this.props
    const {x, y} = item.position
    const {width, height} = item.size
    return <Movable item={item} key={item.id}>
      <rect
        x={x} y={y} width={width} height={height}
        fill={item.fill}
        stroke={item.stroke}
        strokeWidth={item.strokeWidth}
      />
    </Movable>
  }
}
