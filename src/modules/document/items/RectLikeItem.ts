import { Vec2 } from 'paintvec'
import { observable } from 'mobx'
import { Item, ItemData, undoable } from './Item'

export interface RectLikeItemData extends ItemData {
  x: number
  y: number
  width: number
  height: number
}

export
abstract class RectLikeItem extends Item {
  @undoable @observable position = new Vec2()
  @undoable @observable size = new Vec2()

  loadData (data: RectLikeItemData) {
    super.loadData(data)
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
