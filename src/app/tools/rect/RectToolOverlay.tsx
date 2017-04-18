import * as React from 'react'
import {action} from 'mobx'
import {Vec2, Rect} from 'paintvec'
import {documentManager} from '../../../core/DocumentManager'
import {toolManager} from '../../../core/ToolManager'
import {RectItem} from '../../../core/items/RectItem'
import {OvalItem} from '../../../core/items/OvalItem'
import {RectToolType} from './RectTool'

export
class RectToolOverlay extends React.Component<{size: Vec2, type: RectToolType}, {}> {
  startPos: Vec2|undefined
  item: RectItem|OvalItem|undefined

  render () {
    const {width, height} = this.props.size
    return <rect
      width={width} height={height} fill='transparent'
      onMouseDown={this.onMouseDown}
      onMouseMove={this.onMouseMove}
      onMouseUp={this.onMouseUp}
    />
  }

  private newItem () {
    switch (this.props.type) {
      case 'oval':
        return new OvalItem()
      case 'rect':
      default:
        return new RectItem()
    }
  }

  @action private onMouseDown = (event: React.MouseEvent<SVGRectElement>) => {
    const nativeEv = event.nativeEvent as MouseEvent
    this.startPos = new Vec2(nativeEv.offsetX, nativeEv.offsetY)
    this.item = this.newItem()
    this.item.rect = new Rect(this.startPos, this.startPos)
    documentManager.document.items.push(this.item)
  }

  @action private onMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    if (this.startPos && this.item) {
      const nativeEv = event.nativeEvent as MouseEvent
      const pos = new Vec2(nativeEv.offsetX, nativeEv.offsetY)
      this.item.rect = Rect.fromTwoPoints(this.startPos, pos)
    }
  }

  @action private onMouseUp = (event: React.MouseEvent<SVGRectElement>) => {
    this.startPos = undefined
    this.item = undefined
    toolManager.current = undefined
  }
}
