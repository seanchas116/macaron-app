import {observable} from 'mobx'
import {Document} from '../Document'
import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'

export interface RectItemProps extends RectLikeItemProps {
  type: 'rect'
  radius: number
}

export
class RectItem extends RectLikeItem {
  name = 'Rectangle'
  @observable radius = 0

  constructor (document: Document, props: RectItemProps, id?: string) {
    super(document, props, id)
    this.radius = props.radius
  }

  clone () {
    return new RectItem(this.document, this.toProps())
  }

  toProps (): RectItemProps {
    const {radius} = this
    return {
      ...super.toProps(),
      type: 'rect',
      radius
    }
  }
}
