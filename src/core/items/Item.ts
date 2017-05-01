import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Vec2, Rect} from 'paintvec'
import {Document} from '../Document'
import {GroupItem} from './GroupItem'

export
abstract class Item {
  @observable name = ''
  @observable fill = '#888888'
  @observable stroke = '#000000'
  @observable strokeWidth = 1
  @observable parent: GroupItem|undefined
  readonly id = uuid()

  abstract position: Vec2
  abstract size: Vec2

  get rect() {
    return Rect.fromSize(this.position, this.size)
  }
  set rect(rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  constructor (public readonly document: Document) {
  }

  abstract render (): JSX.Element
  abstract clone (): Item
  copyPropsFrom (other: Item) {
    this.name = other.name
    this.fill = other.fill
    this.stroke = other.stroke
    this.strokeWidth = other.strokeWidth
    this.position = other.position
  }
}
