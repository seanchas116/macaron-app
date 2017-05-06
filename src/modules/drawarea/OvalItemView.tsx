import * as React from 'react'
import {observer} from 'mobx-react'
import {OvalItem} from '../document/OvalItem'
import {Movable} from './Movable'
import {itemPreview} from './ItemPreview'

@observer
export class OvalItemView extends React.Component<{item: OvalItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.getOrOriginal(item)
    const center = preview.rect.center
    const radius = preview.rect.size.mulScalar(0.5)
    return <Movable item={item} key={item.id}>
      <ellipse
        cx={center.x} cy={center.y} rx={radius.x} ry={radius.y}
        fill={preview.fill}
        stroke={preview.stroke}
        strokeWidth={preview.strokeWidth}
      />
    </Movable>
  }
}
