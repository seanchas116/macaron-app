import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item, ItemData} from './Item'
import {Document} from '../Document'

export interface RectLikeItemData extends ItemData {
  x: number
  y: number
  width: number
  height: number
}

export
abstract class RectLikeItem extends Item {
  @observable position: Vec2
  @observable size: Vec2

  constructor (public readonly document: Document, data: RectLikeItemData) {
    super(document, data)
    this.position = new Vec2(data.x, data.y)
    this.size = new Vec2(data.width, data.height)
  }

  toData (): RectLikeItemData {
    const {x, y} = this.position
    const {width, height} = this.size
    return {
      ...super.toData(),
      x, y,
      width, height
    }
  }
}
