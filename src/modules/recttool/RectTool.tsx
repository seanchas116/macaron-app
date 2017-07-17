import * as React from 'react'
import { Vec2 } from 'paintvec'
import { Tool } from '../drawarea'
import { RectToolOverlay } from './RectToolOverlay'

export type RectToolType = 'rect' | 'oval' | 'text'

export
class RectTool extends Tool {
  id = `org.macaron.rect.${this.type}`

  get icon () {
    switch (this.type) {
      case 'rect':
      default:
        return require('./rect.svg')
      case 'oval':
        return require('./oval.svg')
      case 'text':
        return require('./text.svg')
    }
  }

  constructor (public type: RectToolType) {
    super()
  }

  renderOverlay (size: Vec2) {
    return <RectToolOverlay size={size} type={this.type} />
  }

  onKeyDown (event: React.KeyboardEvent<HTMLElement>) {
    // do nothing
  }
}
