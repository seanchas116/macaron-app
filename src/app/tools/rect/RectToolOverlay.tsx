import * as React from 'react'
import {action} from 'mobx'
import {Vec2, Rect} from 'paintvec'
import {Document} from '../../../core/Document'
import {documentManager} from '../../../core/DocumentManager'
import {toolManager} from '../../../core/ToolManager'
import {RectItem} from '../../../core/items/RectItem'
import {TextItem} from '../../../core/items/TextItem'
import {OvalItem} from '../../../core/items/OvalItem'
import {PointerEvents} from '../../../util/components/PointerEvents'
import {RectToolType} from './RectTool'

export
class RectToolOverlay extends React.Component<{size: Vec2, type: RectToolType}, {}> {
  startPos: Vec2|undefined
  item: RectItem|OvalItem|undefined

  render () {
    const {width, height} = this.props.size
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
    >
      <rect width={width} height={height} fill='transparent' />
    </PointerEvents>
  }

  private newItem (document: Document) {
    switch (this.props.type) {
      case 'oval':
        return new OvalItem(document)
      case 'text':
        return new TextItem(document, new Vec2(10, 10))
      case 'rect':
      default:
        return new RectItem(document)
    }
  }

  @action private onPointerDown = (event: PointerEvent) => {
    const elem = event.currentTarget as SVGRectElement
    elem.setPointerCapture(event.pointerId)

    this.startPos = new Vec2(event.offsetX, event.offsetY)
    const {document} = documentManager
    this.item = this.newItem(document)
    this.item.rect = new Rect(this.startPos, this.startPos)
    document.rootItem.children.unshift(this.item)
    document.selectedItems = new Set([this.item])
  }

  @action private onPointerMove = (event: PointerEvent) => {
    if (this.startPos && this.item) {
      const pos = new Vec2(event.offsetX, event.offsetY)
      this.item.rect = Rect.fromTwoPoints(this.startPos, pos)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.startPos = undefined
    this.item = undefined
    toolManager.current = undefined
  }
}
