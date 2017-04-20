import * as React from 'react'
import {observable} from 'mobx'
import {Item} from './Item'

export
class GroupItem extends Item {
  readonly children = observable<Item>([])

  render () {
    return <g>
      {this.children.map(c => c.render())}
    </g>
  }
}
