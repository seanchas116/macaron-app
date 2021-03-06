import * as React from 'react'
import { observer } from 'mobx-react'
import { action, reaction, computed, observable } from 'mobx'
import { Rect, Vec2 } from 'paintvec'
import { ResizeHandles } from './ResizeHandles'
import { Item, documentManager } from '../document'
import { itemSnapper } from './ItemSnapper'
import { Alignment } from '../../util/Types'

@observer
export
class ItemResizeHandles extends React.Component<{items: Item[]}, {}> {
  private dragging = false
  private disposers: (() => void)[] = []
  private items: Item[] = []
  @observable private positions: [Vec2, Vec2]|undefined
  private originalPositions: [Vec2, Vec2]|undefined
  private originalRects = new Map<Item, Rect>()

  @computed get rect () {
    return Rect.union(...this.props.items.map(i => i.globalRect))
  }

  componentDidMount () {
    this.updatePositions()
    this.disposers.push(
      reaction(() => this.rect, () => {
        if (!this.dragging) {
          this.updatePositions()
        }
      })
    )
  }

  componentWillUnmount () {
    this.disposers.forEach(f => f())
  }

  render () {
    const {positions} = this
    if (!positions) {
      return <g />
    }
    return <ResizeHandles
      p1={positions[0]}
      p2={positions[1]}
      snap={this.snap}
      onChangeBegin={this.onChangeBegin}
      onChange={this.onChange}
      onChangeEnd={this.onChangeEnd}
    />
  }

  private snap = (pos: Vec2, xAlign: Alignment, yAlign: Alignment) => {
    if (this.rect) {
      return itemSnapper.snapPos(pos, xAlign, yAlign)
    } else {
      return pos
    }
  }

  @action private onChangeBegin = () => {
    this.dragging = true
    this.originalPositions = this.positions
    this.items = this.props.items
    for (const item of this.items) {
      this.originalRects.set(item, item.globalRect)
    }
    itemSnapper.setTargetItems(this.items)
  }

  @action private onChange = (p1: Vec2, p2: Vec2) => {
    if (!this.originalPositions) {
      return
    }
    for (const item of this.items) {
      const origRect = this.originalRects.get(item)!
      const [origP1, origP2] = this.originalPositions
      const ratio = p2.sub(p1).div(origP2.sub(origP1))
      const topLeft = origRect.topLeft.sub(origP1).mul(ratio).add(p1)
      const bottomRight = origRect.bottomRight.sub(origP1).mul(ratio).add(p1)
      const rect = Rect.fromTwoPoints(topLeft, bottomRight)
      item.globalRect = rect
    }

    this.positions = [p1, p2]
  }

  @action private onChangeEnd = () => {
    documentManager.document.versionControl.commit('Resize Items')

    this.dragging = false
    this.items = []
    this.originalPositions = undefined
    this.originalRects = new Map()

    this.updatePositions()
    itemSnapper.clear()
  }

  private updatePositions () {
    const {rect} = this
    if (rect) {
      this.positions = [rect.topLeft, rect.bottomRight]
    } else {
      this.positions = undefined
    }
  }
}
