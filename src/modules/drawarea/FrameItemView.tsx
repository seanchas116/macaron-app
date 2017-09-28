import * as React from 'react'
import { observer } from 'mobx-react'

import { FrameItem } from '../document'
import { renderItem } from './renderItem'
import { Movable } from './Movable'

@observer
export class FrameItemView extends React.Component<{item: FrameItem}, {}> {
  render () {
    const {item} = this.props
    const transform = `translate(${item.position.x}, ${item.position.y})`
    const isTopLevel = !!item.parent && !item.parent.parent
    return <Movable item={item} key={item.id}>
      <g transform={transform}>
        {isTopLevel &&
          <rect
            x={-0.5} y={-0.5} width={item.size.x + 0.5} height={item.size.y + 0.5}
            fill='white' stroke='#BBB' strokeWidth={1}
          />}
        <rect
          x={0} y={0} width={item.size.x} height={item.size.y}
          fill='transparent' stroke='transparent'
        />
        {item.children.map(renderItem)}
      </g>
    </Movable>
  }
}
