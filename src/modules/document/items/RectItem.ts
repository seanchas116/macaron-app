import { observable } from 'mobx'
import { undoable } from './Item'
import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface RectItemData extends RectLikeItemData {
  type: 'rect'
  radius: number
}

export
class RectItem extends RectLikeItem {
  name = 'Rectangle'
  @undoable @observable radius = 0

  loadData (data: RectItemData) {
    super.loadData(data)
    this.radius = data.radius
  }

  toData (): RectItemData {
    const {radius} = this
    return {
      ...super.toData(),
      type: 'rect',
      radius
    }
  }
}
