import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item, ItemProps} from './Item'
import {Document} from '../Document'

export interface RectLikeItemProps extends ItemProps {
  x: number
  y: number
  width: number
  height: number
}

export
abstract class RectLikeItem extends Item {
  @observable position: Vec2
  @observable size: Vec2

  constructor (public readonly document: Document, props: RectLikeItemProps, id?: string) {
    super(document, props, id)
    this.position = new Vec2(props.x, props.y)
    this.size = new Vec2(props.width, props.height)
  }

  toProps (): RectLikeItemProps {
    const {x, y} = this.position
    const {width, height} = this.size
    return {
      ...super.toProps(),
      x, y,
      width, height
    }
  }
}
