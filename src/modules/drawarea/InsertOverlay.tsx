import * as React from 'react'
import { action } from 'mobx'
import { Vec2, Rect } from 'paintvec'
import { Item, documentManager } from '../document'
import { itemSnapper, DrawArea } from '../drawarea'
import { PointerEvents } from '../../util/components/PointerEvents'

interface InsertOverlayProps {
  size: Vec2
  commitTitle: string
  create (pos: Vec2): Item
  drag (startPos: Vec2, pos: Vec2): void
  finish (): void
}

export class InsertOverlay extends React.Component<InsertOverlayProps, {}> {
  private startPos = new Vec2()
  private offset = new Vec2()
  private item: Item|undefined

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

  @action private onPointerDown = (event: PointerEvent) => {
    const elem = event.currentTarget as SVGRectElement
    elem.setPointerCapture(event.pointerId)

    const globalPos = this.snap(DrawArea.posFromEvent(event))

    const {document} = documentManager
    const frame = document.frameAt(globalPos)
    const parent = frame || document.rootItem
    this.offset = parent.origin
    this.startPos = globalPos.sub(this.offset)
    this.item = this.props.create(this.startPos)
    parent.appendChild(this.item)
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const pos = this.snap(DrawArea.posFromEvent(event)).sub(this.offset)
    if (this.item) {
      this.props.drag(this.startPos, pos)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    if (!this.item) {
      return
    }
    documentManager.document.versionControl.commit(this.props.commitTitle)
    documentManager.document.selectedItems.replace([this.item])
    this.item = undefined
    this.props.finish()
  }

  private snap (pos: Vec2) {
    // snap twice to connect vertical & horizontal snap lines
    // TODO: pass correct x/y alignment
    return itemSnapper.snapPos(itemSnapper.snapPos(pos, 'center', 'center'), 'center', 'center')
  }
}
