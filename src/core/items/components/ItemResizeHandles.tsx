import * as React from 'react'
import {observer} from 'mobx-react'
import {action, reaction, computed, observable} from 'mobx'
import {autobind} from 'core-decorators'
import {Rect, Vec2} from 'paintvec'
import {ResizeHandles} from './ResizeHandles'
import {Item} from '../Item'
import {RectItem} from '../RectItem'

@observer
export
class ItemResizeHandles extends React.Component<{item: Item}, {}> {
  private dragging = false
  private disposers: (() => void)[] = []
  @observable private positions: [Vec2, Vec2]|undefined

  @computed get rect () {
    return this.props.item.rect
  }

  componentDidMount () {
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
    const {item} = this.props
    const showBoundingBox = !(item instanceof RectItem)
    return <ResizeHandles
      showBoundingBox={showBoundingBox}
      p1={positions[0]}
      p2={positions[1]}
      onChangeBegin={this.onChangeBegin}
      onChange={this.onChange}
      onChangeEnd={this.onChangeEnd}
    />
  }

  @autobind @action private onChangeBegin () {
    this.dragging = true
  }

  @autobind @action private onChange (p1: Vec2, p2: Vec2) {
    const rect = Rect.fromTwoPoints(p1, p2)
    const {item} = this.props
    item.rect = rect
    // TODO: handle flipping

    this.positions = [p1, p2]
  }

  @autobind @action private onChangeEnd () {
    this.dragging = false
    this.updatePositions()
  }

  private updatePositions () {
    const {rect} = this.props.item
    this.positions = [rect.topLeft, rect.bottomRight]
  }
}
