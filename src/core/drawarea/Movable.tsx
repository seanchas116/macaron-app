import * as React from 'react'
import {Vec2} from 'paintvec'
import {action} from 'mobx'
import {autobind} from 'core-decorators'
import {PointerEvents} from '../../util/components/PointerEvents'
import {Item} from '../items/Item'

export
class Movable extends React.Component<{item: Item}, {}> {
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
      {React.cloneElement(React.Children.only(this.props.children), {
        onClick: this.onClick
      })}
    </PointerEvents>
  }

  @autobind @action private onPointerDown (event: PointerEvent) {
    const target = event.currentTarget as Element
    target.setPointerCapture(event.pointerId)
    this.dragOrigin = new Vec2(event.clientX, event.clientY)
    this.dragging = true

    const {document} = this.props.item
    document.selectItem(this.props.item, event.shiftKey)
    this.items = document.selectedItems
    for (const item of this.items) {
      this.origins.set(item, item.position)
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
    }
  }
  @autobind @action private onPointerUp (event: PointerEvent) {
    this.dragging = false
    this.items = new Set()
    this.origins = new Map()
  }
  @autobind @action private onClick (event: React.MouseEvent<Element>) {
    event.stopPropagation()
  }
}
