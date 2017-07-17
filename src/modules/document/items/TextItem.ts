import { observable } from 'mobx'
import { RectLikeItem, RectLikeItemData } from './RectLikeItem'

export interface TextItemData extends RectLikeItemData {
  type: 'text'
  text: string
}

export
class TextItem extends RectLikeItem {
  name = 'Text'
  @observable text = 'Text'

  clone () {
    const item = new TextItem(this.document)
    item.loadData(this.toData())
    return item
  }

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
