import * as React from 'react'
import {observable} from 'mobx'
import {RectLikeItem, RectLikeItemData} from './RectLikeItem'
import {TextItemView} from '../drawarea/TextItemView'
import {Document} from '../Document'

export interface TextItemData extends RectLikeItemData {
  type: 'text'
  text: string
}

export
class TextItem extends RectLikeItem {
  name = 'Text'
  @observable text: string

  constructor (public readonly document: Document, data: TextItemData) {
    super(document, data)
    this.text = data.text
  }

  render (): JSX.Element {
    return <TextItemView item={this} key={this.id}/>
  }

  clone () {
    return new TextItem(this.document, this.toData())
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
