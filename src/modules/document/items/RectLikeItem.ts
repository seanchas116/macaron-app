import { Vec2 } from 'paintvec'
import { observable } from 'mobx'
import { Item, ItemData, undoable } from './Item'

export interface RectLikeItemData extends ItemData {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

export
abstract class RectLikeItem extends Item {
  @undoable @observable position = new Vec2()
  @undoable @observable size = new Vec2()
  @undoable @observable radius = 0

  loadData (data: RectLikeItemData) {
    super.loadData(data)
    this.position = new Vec2(data.x, data.y)
    this.size = new Vec2(data.width, data.height)
    this.radius = data.radius
  }

  toData (): RectLikeItemData {
    const {x, y} = this.position
    const {width, height} = this.size
    const {radius} = this
    return {
      ...super.toData(),
      x, y,
      width, height,
      radius
    }
  }
}
