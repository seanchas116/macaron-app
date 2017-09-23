import * as React from 'react'
import { observer } from 'mobx-react'

import { FrameItem } from '../document'
import { renderItem } from './renderItem'

@observer
export class FrameItemView extends React.Component<{item: FrameItem}, {}> {
  render () {
    const {item} = this.props
    return <g key={item.id}>
      {[...item.children].reverse().map(renderItem)}
    </g>
  }
}
