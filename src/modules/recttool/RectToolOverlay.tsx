import * as React from 'react'
import {action} from 'mobx'
import {Vec2, Rect} from 'paintvec'
import {Document, documentManager, GroupItem, RectLikeItem, RectItem, TextItem, OvalItem, ItemInsertCommand} from '../document'
import {toolManager, itemPreview} from '../drawarea'
import {PointerEvents} from '../../util/components/PointerEvents'
import {RectToolType} from './RectTool'

export
class RectToolOverlay extends React.Component<{size: Vec2, type: RectToolType}, {}> {
  startPos: Vec2|undefined
  parent: GroupItem|undefined
  item: RectLikeItem|undefined

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
        return new TextItem(document)
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
    this.parent = document.rootItem
    this.item = this.newItem(document)
    this.item.rect = new Rect(this.startPos, this.startPos).translate(document.scroll)
    const children = [this.item, ...this.parent.children]
    itemPreview.addChildren(this.parent, children)
  }

  @action private onPointerMove = (event: PointerEvent) => {
    if (this.startPos && this.item) {
      const {document} = documentManager
      const pos = new Vec2(event.offsetX, event.offsetY)
      this.item.rect = Rect.fromTwoPoints(this.startPos, pos).translate(document.scroll)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.commit()
    this.startPos = undefined
    this.item = undefined
    toolManager.current = undefined
    itemPreview.clear()
  }

  @action private commit () {
    const {item, parent} = this
    if (!item || !parent) {
      return
    }
    const {document} = documentManager
    document.history.push(new ItemInsertCommand('Add Item', parent, item, parent.childAt(0)))
    document.selectedItems.replace([item])
  }
}
