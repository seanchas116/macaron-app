import {observable} from 'mobx'
import {PathItem} from '../document'

export class DrawAreaMode {
  @observable pathItemToEdit: PathItem|undefined
}

export const drawAreaMode = new DrawAreaMode()
