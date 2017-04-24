import * as React from 'react'
import {Vec2} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'
import {Movable} from '../drawarea/Movable'

export
class TextItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Rectangle'

  render (): JSX.Element {
    const {x, y} = this.position
    // const {width, height} = this.size
    return <Movable item={this} key={this.id}>
      <text
        x={x} y={y}>
        test
      </text>
    </Movable>
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
