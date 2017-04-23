import * as React from 'react'
import {Vec2} from 'paintvec'
import {autobind} from 'core-decorators'
import {PointerEvents} from '../../../util/components/PointerEvents'
import {Item} from '../Item'

export
class Movable extends React.Component<{item: Item}, {}> {
  private dragOrigin = new Vec2()
  private posOrigin = new Vec2()
  private dragging = false

  render () {
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
      >
      {this.props.children}
    </PointerEvents>
  }

  @autobind private onPointerDown (event: PointerEvent) {
    const target = event.currentTarget as Element
    target.setPointerCapture(event.pointerId)
    this.dragOrigin = new Vec2(event.clientX, event.clientY)
    this.posOrigin = this.props.item.position
    this.dragging = true
  }
  @autobind private onPointerMove (event: PointerEvent) {
    if (!this.dragging) {
      return
    }
    const pos = new Vec2(event.clientX, event.clientY)
    const offset = pos.sub(this.dragOrigin)
    this.props.item.position = this.posOrigin.add(offset)
  }
  @autobind private onPointerUp (event: PointerEvent) {
    this.dragging = false
  }
}
