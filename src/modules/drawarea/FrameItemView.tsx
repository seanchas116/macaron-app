import * as React from 'react'
import { observer } from 'mobx-react'

import { FrameItem } from '../document'
import { renderItem } from './renderItem'

@observer
export class FrameItemView extends React.Component<{item: FrameItem}, {}> {
  render () {
    const {item} = this.props
    const transform = `translate(${item.position.x}, ${item.position.y})`
    return <g key={item.id} transform={transform}>
      <rect x={0} y={0} width={item.size.x} height={item.size.y} fill={'transparent'} stroke={'none'} />
      {[...item.children].reverse().map(renderItem)}
    </g>
  }
}
