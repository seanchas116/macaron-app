import * as React from 'react'
import {GroupItem} from '../document/GroupItem'

export class GroupItemView extends React.Component<{item: GroupItem}, {}> {
  render () {
    const {item} = this.props
    return <g key={item.id}>
      {[...item.children].reverse().map(c => c.render())}
    </g>
  }
}
