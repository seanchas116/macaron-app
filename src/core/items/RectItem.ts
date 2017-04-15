import {Rect} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'

export
class RectItem extends Item {
  @observable rect = new Rect()
}
