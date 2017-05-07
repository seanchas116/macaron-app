import {observable} from 'mobx'
import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'
import {Document} from '../Document'

export interface TextItemProps extends RectLikeItemProps {
  type: 'text'
  text: string
}

export
class TextItem extends RectLikeItem {
  name = 'Text'
  @observable text: string

  constructor (public readonly document: Document, data: TextItemProps, id?: string) {
    super(document, data, id)
    this.text = data.text
  }

  clone () {
    return new TextItem(this.document, this.toProps())
  }

  toProps (): TextItemProps {
    const {text} = this
    return {
      ...super.toProps(),
      type: 'text',
      text
    }
  }
}
