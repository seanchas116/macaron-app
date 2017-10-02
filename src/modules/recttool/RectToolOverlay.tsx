import * as React from 'react'
import { action } from 'mobx'
import { Vec2, Rect } from 'paintvec'
import { documentManager, RectLikeItem, RectItem, TextItem, OvalItem, FrameItem } from '../document'
import { toolManager, itemSnapper, InsertOverlay } from '../drawarea'
import { RectToolType } from './RectTool'

export
class RectToolOverlay extends React.Component<{size: Vec2, type: RectToolType}, {}> {
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
    return <InsertOverlay
      size={this.props.size}
      commitTitle='Add Item'
      onCreate={this.handleCreate}
      onDrag={this.handleDrag}
      onFinish={this.handleFinish}
    />
  }

  private newItem () {
    const {document} = documentManager
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

  @action private handleCreate = (pos: Vec2) => {
    this.item = this.newItem()
    this.item.rect = new Rect(pos, pos)
    return this.item
  }

  @action private handleDrag = (startPos: Vec2, pos: Vec2) => {
    if (this.item) {
      this.item.rect = Rect.fromTwoPoints(startPos, pos)
    }
  }

  @action private handleFinish = () => {
    toolManager.currentId = undefined
  }
}
