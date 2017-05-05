import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Vec2, Rect} from 'paintvec'
import {Document} from '../Document'
import {GroupItem} from './GroupItem'

export interface ItemProps {
  type: string
  name: string
  fill: string
  stroke: string
  strokeWidth: number
}

// workaround for https://github.com/Microsoft/TypeScript/issues/4521
type GroupItem_ = GroupItem

export
abstract class Item {
  @observable name: string
  @observable fill: string
  @observable stroke: string
  @observable strokeWidth: number
  @observable parent: GroupItem_|undefined
  readonly id: string

  abstract position: Vec2
  abstract size: Vec2

  get rect() {
    return Rect.fromSize(this.position, this.size)
  }
  set rect(rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  constructor (public readonly document: Document, props: ItemProps, id?: string) {
    this.id = id || uuid()
    this.name = props.name
    this.fill = props.fill
    this.stroke = props.stroke
    this.strokeWidth = props.strokeWidth
  }

  abstract render (): JSX.Element
  abstract clone (): Item

  toProps (): ItemProps {
    const {name, fill, stroke, strokeWidth} = this
    return {
      type: 'none',
      name,
      fill,
      stroke,
      strokeWidth
    }
  }

  forEachDescendant (action: (item: Item) => void) {
    action(this)
    if (this instanceof GroupItem) {
      for (const child of this.children) {
        child.forEachDescendant(action)
      }
    }
  }
}
