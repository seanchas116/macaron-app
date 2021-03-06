import * as React from 'react'
import { Vec2, Rect } from 'paintvec'
import { computed, action } from 'mobx'
import { PointerEvents } from '../../util/components/PointerEvents'
import { Item, documentManager } from '../document'
import { itemSnapper } from './ItemSnapper'

export
class Movable extends React.Component<{item: Item, movable?: boolean}, {}> {
  private dragOrigin = new Vec2()
  private dragging = false
  private items = new Set<Item>()
  private originalRects = new Map<Item, Rect>()
  private originalRect: Rect|undefined

  @computed get clickThrough () {
    const {item} = this.props
    const {document} = item

    return [...document.selectedItems].some(selected => item.includes(selected))
  }

  render () {
    const child = React.Children.only(this.props.children)
    const clickableBorder = this.props.item.strokeEnabled && React.cloneElement(child, {
      fill: 'none',
      stroke: 'transparent',
      strokeWidth: 6
    })
    return <PointerEvents
      onPointerDownCapture={this.onPointerDown}
      onPointerMoveCapture={this.onPointerMove}
      onPointerUpCapture={this.onPointerUp}
      >
      <g onDoubleClick={this.onDoubleClick}>
        {clickableBorder}
        {child}
      </g>
    </PointerEvents>
  }

  @action private onDoubleClick = (event: React.MouseEvent<SVGGElement>) => {
    if (this.clickThrough) {
      return
    }
    this.cancel()
    const {item} = this.props
    const {document} = item
    document.selectedItems.replace([item])
    if (item.focusable) {
      document.focusedItem = item
    }
    event.stopPropagation()
  }

  @action private onPointerDown = (event: PointerEvent) => {
    if (this.clickThrough) {
      return
    }
    event.stopPropagation()
    const {document} = this.props.item
    if (event.shiftKey) {
      document.selectedItems.add(this.props.item)
    } else {
      document.selectedItems.replace([this.props.item])
    }
    this.items = document.selectedItems.peek()
    for (const item of this.items) {
      this.originalRects.set(item, item.globalRect)
    }
    this.originalRect = Rect.union(...this.originalRects.values())

    const movable = this.props.movable !== false
    if (movable) {
      const target = event.currentTarget as Element
      target.setPointerCapture(event.pointerId)
      this.dragOrigin = new Vec2(event.clientX, event.clientY)
      this.dragging = true
      itemSnapper.setTargetItems([this.props.item])
    }
  }
  @action private onPointerMove = (event: PointerEvent) => {
    if (this.clickThrough) {
      return
    }
    event.stopPropagation()
    if (!this.dragging || !this.originalRect) {
      return
    }
    const pos = new Vec2(event.clientX, event.clientY)
    const offset = pos.sub(this.dragOrigin)
    const snappedRect = itemSnapper.snapRect(this.originalRect.translate(offset))
    const snappedOffset = snappedRect.topLeft.sub(this.originalRect.topLeft)
    for (const item of this.items) {
      const position = this.originalRects.get(item)!.topLeft.add(snappedOffset)
      item.globalPosition = position
    }
  }
  @action private onPointerUp = (event: PointerEvent) => {
    if (this.clickThrough) {
      return
    }
    event.stopPropagation()
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
    itemSnapper.clear()
  }
}
