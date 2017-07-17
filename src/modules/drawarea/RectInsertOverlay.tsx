import * as React from 'react'
import { action } from 'mobx'
import { Vec2, Rect } from 'paintvec'
import { Document, documentManager, GroupItem, RectLikeItem, RectItem, TextItem, OvalItem, ItemInsertCommand } from '../document'
import { snapper } from './Snapper'
import { itemPreview } from './ItemPreview'
import { PointerEvents } from '../../util/components/PointerEvents'
import { editorState } from './EditorState'

export
class RectToolOverlay extends React.Component<{size: Vec2}, {}> {
  startPos: Vec2|undefined
  parent: GroupItem|undefined
  item: RectLikeItem|undefined

  componentDidMount () {
    const targets: Rect[] = []
    for (const item of documentManager.document.selectedItems) {
      targets.push(...item.siblings.map(s => s.rect))
    }
    snapper.targets = targets
  }

  componentWillUnmount () {
    snapper.clear()
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
    switch (editorState.insertMode) {
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

    const pos = this.snap(new Vec2(event.offsetX, event.offsetY))
    this.startPos = pos
    const {document} = documentManager
    this.parent = document.rootItem
    this.item = this.newItem(document)
    this.item.rect = new Rect(this.startPos, this.startPos).translate(document.scroll)
    const children = [this.item, ...this.parent.children]
    itemPreview.addChildren(this.parent, children)
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const pos = this.snap(new Vec2(event.offsetX, event.offsetY))
    if (this.startPos && this.item) {
      const {document} = documentManager
      this.item.rect = Rect.fromTwoPoints(this.startPos, pos).translate(document.scroll)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    this.commit()
    this.startPos = undefined
    this.item = undefined
    editorState.insertMode = 'none'
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

  private snap (pos: Vec2) {
    // snap twice to connect vertical & horizontal snap lines
    // TODO: pass correct x/y alignment
    return snapper.snapPos(snapper.snapPos(pos, 'center', 'center'), 'center', 'center')
  }
}
