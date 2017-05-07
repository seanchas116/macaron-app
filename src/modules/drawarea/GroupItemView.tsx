import * as React from 'react'
import {observer} from 'mobx-react'

import {Item} from '../document/Item'
import {GroupItem} from '../document/GroupItem'
import {RectItem} from '../document/RectItem'
import {OvalItem} from '../document/OvalItem'
import {TextItem} from '../document/TextItem'

import {RectItemView} from './RectItemView'
import {OvalItemView} from './OvalItemView'
import {TextItemView} from './TextItemView'

import {itemPreview} from './ItemPreview'

export function renderItem (item: Item): JSX.Element|undefined {
  if (item instanceof GroupItem) {
    return <GroupItemView item={item} key={item.id} />
  }
  if (item instanceof RectItem) {
    return <RectItemView item={item} key={item.id} />
  }
  if (item instanceof OvalItem) {
    return <OvalItemView item={item} key={item.id} />
  }
  if (item instanceof TextItem) {
    return <TextItemView item={item} key={item.id} />
  }
}

@observer
export class GroupItemView extends React.Component<{item: GroupItem}, {}> {
  render () {
    const {item} = this.props
    const children = itemPreview.previewChildren(item)
    return <g key={item.id}>
      {[...children].reverse().map(renderItem)}
    </g>
  }
}
