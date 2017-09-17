import * as React from 'react'

import { Item, GroupItem, RectItem, OvalItem, TextItem, PathItem } from '../document'

import { RectItemView } from './RectItemView'
import { OvalItemView } from './OvalItemView'
import { TextItemView } from './TextItemView'
import { PathItemView } from './PathItemView'
import { GroupItemView } from './GroupItemView'

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
