import { observable } from 'mobx'
import { undoable } from './Item'
import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface TextItemData extends RectLikeItemData {
  type: 'text'
  text: string
}

export
class TextItem extends RectLikeItem {
  name = 'Text'
  @undoable @observable text = 'Text'

  loadData (data: TextItemData) {
    super.loadData(data)
    this.text = data.text
  }

  toData (): TextItemData {
    const {text} = this
    return {
      ...super.toData(),
      type: 'text',
      text
    }
  }
}
