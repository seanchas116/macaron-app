import * as React from 'react'
import {observer} from 'mobx-react'
import {action, reaction, computed, observable} from 'mobx'
import {autobind} from 'core-decorators'
import {Rect, Vec2} from 'paintvec'
import {ResizeHandles} from './ResizeHandles'
import {Item} from '../items/Item'

@observer
export
class ItemResizeHandles extends React.Component<{items: Item[]}, {}> {
  private dragging = false
  private disposers: (() => void)[] = []
  @observable private positions: [Vec2, Vec2]|undefined
  private originalPositions: [Vec2, Vec2]|undefined
  private originalRects = new Map<Item, Rect>()

  @computed get rect () {
    return Rect.union(...this.props.items.map(i => i.rect))
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
      onChangeBegin={this.onChangeBegin}
      onChange={this.onChange}
      onChangeEnd={this.onChangeEnd}
    />
  }

  @autobind @action private onChangeBegin () {
    this.dragging = true
    this.originalPositions = this.positions
    for (const item of this.props.items) {
      this.originalRects.set(item, item.rect)
    }
  }

  @autobind @action private onChange (p1: Vec2, p2: Vec2) {
    if (!this.originalPositions) {
      return
    }
    const {items} = this.props
    for (const item of items) {
      const origRect = this.originalRects.get(item)!
      const [origP1, origP2] = this.originalPositions
      const ratio = p2.sub(p1).div(origP2.sub(origP1))
      const topLeft = origRect.topLeft.sub(origP1).mul(ratio).add(p1)
      const bottomRight = origRect.bottomRight.sub(origP1).mul(ratio).add(p1)
      const rect = Rect.fromTwoPoints(topLeft, bottomRight)
      item.rect = rect
    }

    this.positions = [p1, p2]
  }

  @autobind @action private onChangeEnd () {
    this.dragging = false
    this.originalPositions = undefined
    this.originalRects.clear()
    this.updatePositions()
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
