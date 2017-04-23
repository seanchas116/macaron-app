import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Vec2} from 'paintvec'
import {Document} from '../Document'
import {GroupItem} from './GroupItem'

export
abstract class Item {
  @observable name = ''
  @observable fill = 'gray'
  @observable stroke = 'black'
  @observable strokeWidth = 1
  @observable position = new Vec2()
  @observable parent: GroupItem|undefined
  readonly id = uuid()

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
