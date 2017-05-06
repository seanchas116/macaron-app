import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'

export interface OvalItemProps extends RectLikeItemProps {
  type: 'oval'
}

export
class OvalItem extends RectLikeItem {
  name = 'Oval'

  clone () {
    return new OvalItem(this.document, this.toProps())
  }

  toProps (): OvalItemProps {
    return {
      ...super.toProps(),
      type: 'oval'
    }
  }
}
