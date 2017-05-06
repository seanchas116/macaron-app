import * as React from 'react'
import {observer} from 'mobx-react'
import {action, reaction, computed, observable} from 'mobx'
import {autobind} from 'core-decorators'
import {Rect, Vec2} from 'paintvec'
import {ResizeHandles} from './ResizeHandles'
import {Item} from '../document/Item'
import {CompositeCommand} from '../document/CompositeCommand'
import {ItemChangeCommand} from '../document/ItemChangeCommand'
import {documentManager} from '../document/DocumentManager'
import {snapper} from './Snapper'
import {itemPreview} from './ItemPreview'

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
    const previews = this.props.items.map(item => itemPreview.getOrOriginal(item))
    return Rect.union(...previews.map(i => i.rect))
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

  @autobind private snap (pos: Vec2) {
    if (this.rect) {
      return snapper.snapRectPos(this.rect, pos)
    } else {
      return pos
    }
  }

  @autobind @action private onChangeBegin () {
    this.dragging = true
    this.originalPositions = this.positions
    this.items = this.props.items
    for (const item of this.items) {
      this.originalRects.set(item, item.rect)
    }
    const snapTargets: Rect[] = []
    for (const item of this.items) {
      const {parent} = item
      if (parent) {
        for (const child of parent.children) {
          if (!this.props.items.includes(child)) {
            snapTargets.push(child.rect)
          }
        }
      }
      itemPreview.add(item)
    }
    snapper.targets = snapTargets
  }

  @autobind @action private onChange (p1: Vec2, p2: Vec2) {
    if (!this.originalPositions) {
      return
    }
    for (const item of this.items) {
      const preview = itemPreview.get(item)
      if (!preview) {
        return
      }
      const origRect = this.originalRects.get(item)!
      const [origP1, origP2] = this.originalPositions
      const ratio = p2.sub(p1).div(origP2.sub(origP1))
      const topLeft = origRect.topLeft.sub(origP1).mul(ratio).add(p1)
      const bottomRight = origRect.bottomRight.sub(origP1).mul(ratio).add(p1)
      const rect = Rect.fromTwoPoints(topLeft, bottomRight)
      preview.rect = rect
    }

    this.positions = [p1, p2]
  }

  @autobind @action private onChangeEnd () {
    this.commit()

    this.dragging = false
    this.items = []
    this.originalPositions = undefined
    this.originalRects = new Map()

    this.updatePositions()
    snapper.clear()
    itemPreview.clear()
  }

  private commit () {
    const commands: ItemChangeCommand[] = []
    for (const item of this.items) {
      const preview = itemPreview.get(item)
      if (preview) {
        commands.push(new ItemChangeCommand('Resize Item', item, {rect: preview.rect}))
      }
    }
    documentManager.document.history.push(new CompositeCommand('Resize Items', commands))
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
