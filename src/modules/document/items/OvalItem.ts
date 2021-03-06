import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface OvalItemData extends RectLikeItemData {
  type: 'oval'
}

export
class OvalItem extends RectLikeItem {
  name = 'Oval'

  toData (): OvalItemData {
    return {
      ...super.toData(),
      type: 'oval'
    }
  }
}
