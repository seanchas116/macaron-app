import {observable} from 'mobx'
import * as uuid from 'uuid'

export
abstract class Item {
  @observable name = ''
  @observable fill = 'gray'
  @observable stroke = 'black'
  @observable strokeWidth = 1
  readonly id = uuid()
  abstract render (): JSX.Element
}
