import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Vec2, Rect} from 'paintvec'
import {Document} from '../Document'
import {GroupItem} from './GroupItem'

export interface ItemProps {
  type: string
  name: string
  fill: string
  fillEnabled: boolean
  stroke: string
  strokeWidth: number
  strokeEnabled: boolean
}

// workaround for https://github.com/Microsoft/TypeScript/issues/4521
type GroupItem_ = GroupItem

export
abstract class Item {
  @observable name: string
  @observable fill: string
  @observable fillEnabled: boolean
  @observable stroke: string
  @observable strokeEnabled: boolean
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
    this.fillEnabled = props.fillEnabled
    this.stroke = props.stroke
    this.strokeWidth = props.strokeWidth
    this.strokeEnabled = props.strokeEnabled
    document.itemForId.set(this.id, this)
  }

  dispose () {
    this.document.itemForId.delete(this.id)
  }

  abstract clone (opts?: {shallow?: boolean}): Item

  toProps (): ItemProps {
    const {name, fill, fillEnabled, stroke, strokeWidth, strokeEnabled} = this
    return {
      type: 'none',
      name,
      fill,
      fillEnabled,
      stroke,
      strokeWidth,
      strokeEnabled
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
