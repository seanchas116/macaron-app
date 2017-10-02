import * as React from 'react'
import { action } from 'mobx'
import { Vec2, Rect } from 'paintvec'
import { Document, documentManager, RectLikeItem, RectItem, TextItem, OvalItem, FrameItem } from '../document'
import { toolManager, itemSnapper, DrawArea } from '../drawarea'
import { PointerEvents } from '../../util/components/PointerEvents'
import { RectToolType } from './RectTool'

export
class RectToolOverlay extends React.Component<{size: Vec2, type: RectToolType}, {}> {
  private startPos = new Vec2()
  private offset = new Vec2()
  private item: RectLikeItem|undefined

  componentDidMount () {
    const targets: Rect[] = []
    for (const item of documentManager.document.selectedItems) {
      targets.push(...item.siblings.map(s => s.rect))
    }
    itemSnapper.targets = targets
  }

  componentWillUnmount () {
    itemSnapper.clear()
  }

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
      case 'frame':
        return new FrameItem(document)
      case 'rect':
      default:
        return new RectItem(document)
    }
  }

  @action private onPointerDown = (event: PointerEvent) => {
    const elem = event.currentTarget as SVGRectElement
    elem.setPointerCapture(event.pointerId)

    const pos = this.startPos = this.snap(DrawArea.posFromEvent(event))

    const {document} = documentManager
    const frame = document.frameAt(pos)
    this.offset = frame ? frame.globalPosition : new Vec2()

    this.item = this.newItem(document)
    this.item.rect = new Rect(this.startPos, this.startPos).translate(this.offset.neg())

    const parent = frame || document.rootItem
    parent.appendChild(this.item)
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const pos = this.snap(DrawArea.posFromEvent(event))
    if (this.item) {
      this.item.rect = Rect.fromTwoPoints(this.startPos, pos).translate(this.offset.neg())
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    if (!this.item) {
      return
    }
    documentManager.document.versionControl.commit('Add Item')
    documentManager.document.selectedItems.replace([this.item])
    this.item = undefined
    toolManager.currentId = undefined
  }

  private snap (pos: Vec2) {
    // snap twice to connect vertical & horizontal snap lines
    // TODO: pass correct x/y alignment
    return itemSnapper.snapPos(itemSnapper.snapPos(pos, 'center', 'center'), 'center', 'center')
  }
}
