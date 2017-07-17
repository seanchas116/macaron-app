import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface OvalItemData extends RectLikeItemData {
  type: 'oval'
}

export
class OvalItem extends RectLikeItem {
  name = 'Oval'

  clone () {
    const item = new OvalItem(this.document)
    item.loadData(this.toData())
    return item
  }

  toData (): OvalItemData {
    return {
      ...super.toData(),
      type: 'oval'
    }
  }
}
