import * as React from 'react'
import { observer } from 'mobx-react'
import { PathItem } from '../document'
import { Movable } from './Movable'

@observer
export class PathItemView extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const fill = item.fillEnabled ? item.fill : 'none'
    const stroke = item.strokeEnabled ? item.stroke : 'none'
    const {strokeWidth} = item

    return <Movable item={item} key={item.id}>
      <path
        d={item.svgPathData}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Movable>
  }
}
