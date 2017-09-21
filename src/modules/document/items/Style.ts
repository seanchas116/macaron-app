import { observable } from 'mobx'
import { undoable, ItemComponent } from './Item'

export interface StyleData {
  fill: string
  fillEnabled: boolean
  stroke: string
  strokeWidth: number
  strokeEnabled: boolean
}

export class Style extends ItemComponent {
  @undoable @observable fill = '#888888'
  @undoable @observable fillEnabled = true
  @undoable @observable stroke = '#000000'
  @undoable @observable strokeEnabled = true
  @undoable @observable strokeWidth = 1

  toData () {
    const {fill, fillEnabled, stroke, strokeEnabled, strokeWidth} = this
    return {fill, fillEnabled, stroke, strokeEnabled, strokeWidth}
  }
}
