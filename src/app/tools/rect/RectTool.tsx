import * as React from 'react'
import {Vec2} from 'paintvec'
import {Tool} from '../../../core/Tool'
import {RectToolOverlay} from './RectToolOverlay'

export
class RectTool extends Tool {
  id = 'org.macaron.rect'
  icon = require('./icon.svg')

  renderOverlay (size: Vec2) {
    return <RectToolOverlay size={size} />
  }
}
