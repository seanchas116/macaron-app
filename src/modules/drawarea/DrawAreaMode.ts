import {observable} from 'mobx'
import {Item} from '../document'

export class DrawAreaMode {
  @observable itemToEdit: Item|undefined
}

export const drawAreaMode = new DrawAreaMode()
