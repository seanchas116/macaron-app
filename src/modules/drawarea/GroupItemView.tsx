import * as React from 'react'
import { observer } from 'mobx-react'

import { GroupItem } from '../document'
import { renderItem } from './renderItem'

@observer
export class GroupItemView extends React.Component<{item: GroupItem}, {}> {
  render () {
    const {item} = this.props
    return <g key={item.id}>
      {item.children.map(renderItem)}
    </g>
  }
}
