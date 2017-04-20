import {observable} from 'mobx'
import * as uuid from 'uuid'
import {Document} from '../Document'

export
abstract class Item {
  @observable name = ''
  @observable fill = 'gray'
  @observable stroke = 'black'
  @observable strokeWidth = 1
  @observable parent: Item|undefined
  readonly id = uuid()

  constructor (public readonly document: Document) {
  }

  abstract render (): JSX.Element
}
