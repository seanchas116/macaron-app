import * as React from 'react'
import { action } from 'mobx'
import { Vec2, Rect } from 'paintvec'
import { Item, documentManager } from '../document'
import { itemSnapper, DrawArea } from '../drawarea'
import { PointerEvents } from '../../util/components/PointerEvents'

interface InsertOverlayProps {
  size: Vec2
  commitTitle: string
  onCreate (pos: Vec2): Item
  onDrag (startPos: Vec2, pos: Vec2): void
  onFinish (): void
}

export class InsertOverlay extends React.Component<InsertOverlayProps, {}> {
  private startPos = new Vec2()
  private offset = new Vec2()
  private item: Item|undefined

  componentDidMount () {
    // TODO: snap to hovered frame
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

    const globalPos = this.snap(DrawArea.documentPosFromEvent(event))

    const {document} = documentManager
    const frame = document.frameAt(globalPos)
    this.offset = frame ? frame.globalPosition : new Vec2()
    this.startPos = globalPos.sub(this.offset)
    this.item = this.props.onCreate(this.startPos)
    ;(frame || document.rootItem).appendChild(this.item)
  }

  @action private onPointerMove = (event: PointerEvent) => {
    const pos = this.snap(DrawArea.documentPosFromEvent(event)).sub(this.offset)
    if (this.item) {
      this.props.onDrag(this.startPos, pos)
    }
  }

  @action private onPointerUp = (event: PointerEvent) => {
    if (!this.item) {
      return
    }
    documentManager.document.versionControl.commit(this.props.commitTitle)
    documentManager.document.selectedItems.replace([this.item])
    this.item = undefined
    this.props.onFinish()
  }

  private snap (pos: Vec2) {
    pos = pos.round()
    // snap twice to connect vertical & horizontal snap lines
    // TODO: pass correct x/y alignment
    return itemSnapper.snapPos(itemSnapper.snapPos(pos, 'center', 'center'), 'center', 'center')
  }
}
