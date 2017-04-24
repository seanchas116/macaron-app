import * as React from 'react'
import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {Movable} from '../drawarea/Movable'

export
class TextItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Text'
  @observable text = 'Text'

  render (): JSX.Element {
    const {x, y} = this.position
    return <Movable item={this} key={this.id}>
      <foreignObject
        x={x} y={y} width={this.size.width} height={this.size.height}>
        <div style={{width:'100%'}} contentEditable>{this.text}</div>
      </foreignObject>
    </Movable>
  }

  clone () {
    const cloned = new TextItem(this.document, this.originalSize)
    this.copyPropsFrom(cloned)
    return cloned
  }

  copyPropsFrom (other: TextItem) {
    super.copyPropsFrom(other)
    other.size = this.size
  }
}
