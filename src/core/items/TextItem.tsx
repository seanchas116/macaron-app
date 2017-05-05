import * as React from 'react'
import {observable} from 'mobx'
import {RectLikeItem, RectLikeItemProps} from './RectLikeItem'
import {TextItemView} from '../drawarea/TextItemView'
import {Document} from '../Document'

export interface TextItemProps extends RectLikeItemProps {
  type: 'text'
  text: string
}

export
class TextItem extends RectLikeItem {
  name = 'Text'
  @observable text: string

  constructor (public readonly document: Document, data: TextItemProps) {
    super(document, data)
    this.text = data.text
  }

  render (): JSX.Element {
    return <TextItemView item={this} key={this.id}/>
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
