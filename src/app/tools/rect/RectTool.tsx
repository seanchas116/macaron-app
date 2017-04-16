import * as React from 'react'
import {Tool} from '../../../core/Tool'
import {RectToolOverlay} from './RectToolOverlay'

export
class RectTool extends Tool {
  id = 'org.macaron.rect'
  icon = require('./icon.svg')

  renderOverlay () {
    return <RectToolOverlay />
  }
}
