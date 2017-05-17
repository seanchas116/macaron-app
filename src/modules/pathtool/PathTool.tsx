import * as React from 'react'
import {Vec2} from 'paintvec'
import {Tool} from '../drawarea'
import {PathToolOverlay} from './PathToolOverlay'

export
class PathTool extends Tool {
  readonly id = 'org.macaron.path'
  readonly icon = require('./path.svg')

  renderOverlay (size: Vec2) {
    return <PathToolOverlay size={size} />
  }
}
