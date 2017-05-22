import * as React from 'react'
import {observer} from 'mobx-react'
import {PathItem} from '../document'
import {Movable} from './Movable'
import {itemPreview} from './ItemPreview'

@observer
export class PathItemView extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const fill = preview.fillEnabled ? preview.fill : 'none'
    const stroke = preview.strokeEnabled ? preview.stroke : 'none'
    const {strokeWidth} = preview

    return <Movable item={item} key={item.id}>
      <path
        d={preview.svgPathData}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Movable>
  }
}
