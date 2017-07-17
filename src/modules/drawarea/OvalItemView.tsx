import * as React from 'react'
import { observer } from 'mobx-react'
import { OvalItem } from '../document'
import { Movable } from './Movable'
import { itemPreview } from './ItemPreview'

@observer
export class OvalItemView extends React.Component<{item: OvalItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const center = preview.rect.center
    const radius = preview.rect.size.mulScalar(0.5)
    const fill = preview.fillEnabled ? preview.fill : 'none'
    const stroke = preview.strokeEnabled ? preview.stroke : 'none'
    return <Movable item={item} key={item.id}>
      <ellipse
        cx={center.x} cy={center.y} rx={radius.x} ry={radius.y}
        fill={fill}
        stroke={stroke}
        strokeWidth={preview.strokeWidth}
      />
    </Movable>
  }
}
