import * as React from 'react'
import {observer} from 'mobx-react'
import {RectItem} from '../document'
import {Movable} from './Movable'
import {itemPreview} from './ItemPreview'

@observer
export class RectItemView extends React.Component<{item: RectItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const {x, y} = preview.position
    const {width, height} = preview.size
    const fill = preview.fillEnabled ? preview.fill : 'none'
    const stroke = preview.strokeEnabled ? preview.stroke : 'none'
    const {radius} = preview
    return <Movable item={item} key={item.id}>
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={preview.strokeWidth}
        rx={radius} ry={radius}
      />
    </Movable>
  }
}
