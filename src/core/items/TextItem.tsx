import * as React from 'react'
import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {TextItemView} from '../drawarea/TextItemView'

export
class TextItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Text'
  @observable text = 'Text'

  render (): JSX.Element {
    return <TextItemView item={this} key={this.id}/>
  }

  clone () {
    const cloned = new TextItem(this.document)
    this.copyPropsFrom(cloned)
    return cloned
  }

  copyPropsFrom (other: TextItem) {
    super.copyPropsFrom(other)
    other.size = this.size
  }
}
