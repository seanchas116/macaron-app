import {observable} from 'mobx'
import {Item} from '../document'

export class DrawAreaMode {
  @observable focusedItem: Item|undefined
}

export const drawAreaMode = new DrawAreaMode()
