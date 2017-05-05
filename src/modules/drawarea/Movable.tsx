import * as React from 'react'
import {Vec2, Rect} from 'paintvec'
import {action} from 'mobx'
import {autobind} from 'core-decorators'
import {PointerEvents} from '../../util/components/PointerEvents'
import {Item} from '../document/Item'
import {snapper} from './Snapper'

export
class Movable extends React.Component<{item: Item, movable?: boolean}, {}> {
  private dragOrigin = new Vec2()
  private dragging = false
  private items = new Set<Item>()
  private originalRects = new Map<Item, Rect>()
  private originalRect: Rect|undefined

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
      this.originalRects.set(item, item.rect)
    }
    this.originalRect = Rect.union(...this.originalRects.values())

    const movable = this.props.movable !== false
    if (movable) {
      const target = event.currentTarget as Element
      target.setPointerCapture(event.pointerId)
      this.dragOrigin = new Vec2(event.clientX, event.clientY)
      this.dragging = true
      snapper.targets = this.props.item.parent!.children.filter(i => !this.items.has(i)).map(i => i.rect)
    }
  }
  @autobind @action private onPointerMove (event: PointerEvent) {
    if (!this.dragging || !this.originalRect) {
      return
    }
    const pos = new Vec2(event.clientX, event.clientY)
    const offset = pos.sub(this.dragOrigin)
    const snappedRect = snapper.snapRect(this.originalRect.translate(offset))
    const snappedOffset = snappedRect.topLeft.sub(this.originalRect.topLeft)
    for (const item of this.items) {
      item.position = this.originalRects.get(item)!.topLeft.add(snappedOffset)
    }
  }
  @autobind @action private onPointerUp (event: PointerEvent) {
    if (!this.dragging) {
      return
    }
    this.dragging = false
    this.items = new Set()
    this.originalRects = new Map()
    this.originalRect = undefined
    snapper.clear()
  }
}
