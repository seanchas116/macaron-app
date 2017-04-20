import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Document} from '../Document'
import {GroupItem} from './GroupItem'

export
abstract class Item {
  @observable name = ''
  @observable fill = 'gray'
  @observable stroke = 'black'
  @observable strokeWidth = 1
  @observable parent: GroupItem|undefined
  readonly id = uuid()

  constructor (public readonly document: Document) {
  }

  abstract render (): JSX.Element
}
