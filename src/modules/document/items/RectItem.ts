import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface RectItemData extends RectLikeItemData {
  type: 'rect'
}

export
class RectItem extends RectLikeItem {
  name = 'Rectangle'

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
