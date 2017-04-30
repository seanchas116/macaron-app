import * as React from 'react'
import {Vec2} from 'paintvec'
import {action} from 'mobx'
import {autobind} from 'core-decorators'
import {PointerEvents} from '../../util/components/PointerEvents'
import {Item} from '../items/Item'
import {snapper} from './Snapper'

export
class Movable extends React.Component<{item: Item, movable?: boolean}, {}> {
  private dragOrigin = new Vec2()
  private dragging = false
  private items = new Set<Item>()
  private origins = new Map<Item, Vec2>()

  render () {
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
      >
      {React.Children.only(this.props.children)}
    </PointerEvents>
  }

  @autobind @action private onPointerDown (event: PointerEvent) {
    const {document} = this.props.item
    document.selectItem(this.props.item, event.shiftKey)
    this.items = document.selectedItems
    for (const item of this.items) {
      this.origins.set(item, item.position)
    }

    const movable = this.props.movable !== false
    if (movable) {
      const target = event.currentTarget as Element
      target.setPointerCapture(event.pointerId)
      this.dragOrigin = new Vec2(event.clientX, event.clientY)
      this.dragging = true
      snapper.item = this.props.item
      snapper.targetItems.replace(this.props.item.parent!.children.filter(f => f !== this.props.item))
    }
  }
  @autobind @action private onPointerMove (event: PointerEvent) {
    if (!this.dragging) {
      return
    }
    const pos = new Vec2(event.clientX, event.clientY)
    const offset = pos.sub(this.dragOrigin)
    for (const item of this.items) {
      item.position = this.origins.get(item)!.add(offset)
      snapper.snap(this.props.item, this.origins.get(this.props.item)!.add(offset))
    }
  }
  @autobind @action private onPointerUp (event: PointerEvent) {
    if (!this.dragging) {
      return
    }
    this.dragging = false
    this.items = new Set()
    this.origins = new Map()
    snapper.clear()
  }
}
