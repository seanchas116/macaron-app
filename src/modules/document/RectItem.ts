import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'

export interface RectItemProps extends RectLikeItemProps {
  type: 'rect'
}

export
class RectItem extends RectLikeItem {
  name = 'Rectangle'

  clone () {
    return new RectItem(this.document, this.toProps())
  }

  toProps (): RectItemProps {
    return {
      ...super.toProps(),
      type: 'rect'
    }
  }
}
