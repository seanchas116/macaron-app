import {observable} from 'mobx'

export
abstract class Item {
  @observable name = ''
  abstract render (): JSX.Element
}
