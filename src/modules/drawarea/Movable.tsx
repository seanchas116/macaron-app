import * as React from 'react'
import {Vec2, Rect} from 'paintvec'
import {action} from 'mobx'
import {PointerEvents} from '../../util/components/PointerEvents'
import {Item, Command, CompositeCommand, ItemChangeCommand, documentManager} from '../document'
import {snapper} from './Snapper'
import {itemPreview} from './ItemPreview'
import {drawAreaMode} from './DrawAreaMode'

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
    drawAreaMode.itemToEdit = this.props.item
  }

  @action private onPointerDown = (event: PointerEvent) => {
    const {document} = this.props.item
    document.selectItem(this.props.item, event.shiftKey)
    this.items = document.selectedItems.peek()
    for (const item of this.items) {
      this.originalRects.set(item, item.rect)
      itemPreview.addItem(item)
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
      const preview = itemPreview.getItem(item)
      if (preview) {
        preview.position = position
      }
    }
  }
  @action private onPointerUp = (event: PointerEvent) => {
    if (!this.dragging) {
      return
    }
    this.commit()
  }

  private commit () {
    const commands: Command[] = []
    for (const item of this.items) {
      const preview = itemPreview.getItem(item)
      if (preview && !preview.position.equals(item.position)) {
        commands.push(new ItemChangeCommand('Move Item', item, {position: preview.position}))
      }
    }
    if (commands.length > 0) {
      documentManager.document.history.push(new CompositeCommand('Move Items', commands))
    }
    this.cancel()
  }

  private cancel () {
    this.dragging = false
    this.items = new Set()
    this.originalRects = new Map()
    this.originalRect = undefined
    snapper.clear()
    itemPreview.clear()
  }
}
