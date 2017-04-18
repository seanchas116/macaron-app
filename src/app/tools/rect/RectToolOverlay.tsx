import * as React from 'react'
import {action} from 'mobx'
import {Vec2, Rect} from 'paintvec'
import {documentManager} from '../../../core/DocumentManager'
import {toolManager} from '../../../core/ToolManager'
import {RectItem} from '../../../core/items/RectItem'

export
class RectToolOverlay extends React.Component<{size: Vec2}, {}> {
  startPos: Vec2|undefined
  item: RectItem|undefined

  render () {
    const {width, height} = this.props.size
    return <rect
      width={width} height={height} fill='transparent'
      onMouseDown={this.onMouseDown}
      onMouseMove={this.onMouseMove}
      onMouseUp={this.onMouseUp}
    />
  }

  @action onMouseDown = (event: React.MouseEvent<SVGRectElement>) => {
    const nativeEv = event.nativeEvent as MouseEvent
    this.startPos = new Vec2(nativeEv.offsetX, nativeEv.offsetY)
    this.item = new RectItem()
    this.item.rect = new Rect(this.startPos, this.startPos)
    documentManager.document.items.push(this.item)
  }

  @action onMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    if (this.startPos && this.item) {
      const nativeEv = event.nativeEvent as MouseEvent
      const pos = new Vec2(nativeEv.offsetX, nativeEv.offsetY)
      this.item.rect = Rect.fromTwoPoints(this.startPos, pos)
    }
  }

  @action onMouseUp = (event: React.MouseEvent<SVGRectElement>) => {
    this.startPos = undefined
    this.item = undefined
    toolManager.current = undefined
  }
}
