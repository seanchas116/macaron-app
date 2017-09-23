import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface FrameItemData extends RectLikeItemData {
  type: 'frame'
}

export
class FrameItem extends RectLikeItem {
  name = 'Frame'

  toData (): FrameItemData {
    return {
      ...super.toData(),
      type: 'frame'
    }
  }
}
