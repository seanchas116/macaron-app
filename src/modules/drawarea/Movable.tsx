import * as React from 'react'
import { Vec2, Rect } from 'paintvec'
import { action } from 'mobx'
import { PointerEvents } from '../../util/components/PointerEvents'
import { Item, documentManager } from '../document'
import { snapper } from './Snapper'

export
class Movable extends React.Component<{item: Item, movable?: boolean}, {}> {
  private dragOrigin = new Vec2()
  private dragging = false
  private items = new Set<Item>()
  private originalRects = new Map<Item, Rect>()
  private originalRect: Rect|undefined

  render () {
    const child = React.Children.only(this.props.children)
    const clickableBorder = React.cloneElement(child, {
      fill: 'none',
      stroke: 'transparent',
      strokeWidth: 6
    })
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
      >
      <g onDoubleClick={this.onDoubleClick}>
        {clickableBorder}
        {child}
      </g>
    </PointerEvents>
  }

  @action private onDoubleClick = () => {
    this.cancel()
    documentManager.document.focusedItem = this.props.item
  }

  @action private onPointerDown = (event: PointerEvent) => {
    const {document} = this.props.item
    if (event.shiftKey) {
      document.selectedItems.add(this.props.item)
    } else {
      document.selectedItems.replace([this.props.item])
    }
    this.items = document.selectedItems.peek()
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
  @action private onPointerMove = (event: PointerEvent) => {
    if (!this.dragging || !this.originalRect) {
      return
    }
    const pos = new Vec2(event.clientX, event.clientY)
    const offset = pos.sub(this.dragOrigin)
    const snappedRect = snapper.snapRect(this.originalRect.translate(offset))
    const snappedOffset = snappedRect.topLeft.sub(this.originalRect.topLeft)
    for (const item of this.items) {
      const position = this.originalRects.get(item)!.topLeft.add(snappedOffset)
      item.position = position
    }
  }
  @action private onPointerUp = (event: PointerEvent) => {
    if (!this.dragging) {
      return
    }
    this.cancel()
    documentManager.document.versionControl.commit('Move Items')
  }

  private cancel () {
    this.dragging = false
    this.items = new Set()
    this.originalRects = new Map()
    this.originalRect = undefined
    snapper.clear()
  }
}
