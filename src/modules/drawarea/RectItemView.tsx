import * as React from 'react'
import {observer} from 'mobx-react'
import {RectItem} from '../document/RectItem'
import {Movable} from './Movable'
import {itemPreview} from './ItemPreview'

@observer
export class RectItemView extends React.Component<{item: RectItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.getOrOriginal(item)
    const {x, y} = preview.position
    const {width, height} = preview.size
    return <Movable item={item} key={item.id}>
      <rect
        x={x} y={y} width={width} height={height}
        fill={preview.fill}
        stroke={preview.stroke}
        strokeWidth={preview.strokeWidth}
      />
    </Movable>
  }
}
