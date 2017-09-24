import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface FrameItemData extends RectLikeItemData {
  type: 'frame'
}

export
class FrameItem extends RectLikeItem {
  name = 'Frame'

  get canHaveChildren () {
    return true
  }

  get originOffset () {
    return this.position
  }

  toData (): FrameItemData {
    return {
      ...super.toData(),
      type: 'frame'
    }
  }
}
