import * as React from 'react'
import {Vec2} from 'paintvec'
import {Tool} from '../drawarea'
import {PathToolOverlay} from './PathToolOverlay'

export
class PathTool extends Tool {
  readonly id = 'org.macaron.path'
  readonly icon = require('./path.svg')
  overlay: PathToolOverlay|undefined

  renderOverlay (size: Vec2) {
    return <PathToolOverlay size={size} ref={e => this.overlay = e!} />
  }

  onKeyDown (event: React.KeyboardEvent<HTMLElement>) {
    if (this.overlay) {
      this.overlay.onKeyDown(event)
    }
  }
}
