import * as React from 'react'
import {Rect} from 'paintvec'
import {observable} from 'mobx'
import {Item} from './Item'

export
class RectItem extends Item {
  @observable rect = new Rect()

  render () {
    const {left, top, width, height} = this.rect
    return <rect x={left} y={top} width={width} height={height} />
  }
}
