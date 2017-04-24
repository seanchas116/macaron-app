import * as React from 'react'
import {Vec2} from 'paintvec'
import {computed, observable} from 'mobx'
import {Item} from './Item'
import {Movable} from '../drawarea/Movable'

export
class TextItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Text'

  @computed get scale() {
    if(this.originalSize) {
      const sx = this.size.width / this.originalSize.width
      const sy = this.size.height / this.originalSize.height
      return `scale(${sx}, ${sy})`
    }
    return ''
  }

  render (): JSX.Element {
    const {x, y} = this.position
    return <Movable item={this} key={this.id}>
      <text
        x={x} y={y} transform={this.scale}>
        test
      </text>
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
