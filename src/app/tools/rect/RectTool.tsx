import * as React from 'react'
import {Vec2} from 'paintvec'
import {Tool} from '../../../core/Tool'
import {RectToolOverlay} from './RectToolOverlay'

export type RectToolType = 'rect' | 'oval' | 'text'

export
class RectTool extends Tool {
  id = `org.macaron.rect.${this.type}`

  get icon () {
    switch (this.type) {
      case 'rect':
      case 'text':
      default:
        return require('./rect.svg')
      case 'oval':
        return require('./oval.svg')
    }
  }

  constructor (public type: RectToolType) {
    super()
  }

  renderOverlay (size: Vec2) {
    return <RectToolOverlay size={size} type={this.type} />
  }
}
