import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Vec2, Rect} from 'paintvec'
import {Document} from '../Document'
import {GroupItem} from './GroupItem'

export interface ItemData {
  id: string
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
  @observable name = 'Item'
  @observable fill = '#888888'
  @observable fillEnabled = true
  @observable stroke = '#000000'
  @observable strokeEnabled = true
  @observable strokeWidth = 1
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

  constructor (public readonly document: Document, id?: string) {
    this.id = id || uuid()
    document.itemForId.set(this.id, this)
  }

  dispose () {
    this.document.itemForId.delete(this.id)
  }

  abstract clone (opts?: {shallow?: boolean}): Item

  loadData (data: ItemData) {
    this.name = data.name
    this.fill = data.fill
    this.fillEnabled = data.fillEnabled
    this.stroke = data.stroke
    this.strokeWidth = data.strokeWidth
    this.strokeEnabled = data.strokeEnabled
  }

  toData (): ItemData {
    const {id, name, fill, fillEnabled, stroke, strokeWidth, strokeEnabled} = this
    return {
      type: 'none',
      id,
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
