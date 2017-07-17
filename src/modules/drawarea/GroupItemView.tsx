import * as React from 'react'
import { observer } from 'mobx-react'

import { Item, GroupItem, RectItem, OvalItem, TextItem, PathItem } from '../document'

import { RectItemView } from './RectItemView'
import { OvalItemView } from './OvalItemView'
import { TextItemView } from './TextItemView'
import { PathItemView } from './PathItemView'

import { itemPreview } from './ItemPreview'

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
  if (item instanceof PathItem) {
    return <PathItemView item={item} key={item.id} />
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
