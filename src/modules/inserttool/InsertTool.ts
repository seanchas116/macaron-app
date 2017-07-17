import { Tool } from '../tool'
import { editorState } from '../drawarea'

export type RectToolType = 'rect' | 'oval' | 'text' | 'path'

export
class InsertTool implements Tool {
  id = `org.macaron.insert.${this.type}`

  get icon () {
    switch (this.type) {
      case 'rect':
      default:
        return require('./rect.svg')
      case 'oval':
        return require('./oval.svg')
      case 'text':
        return require('./text.svg')
      case 'path':
        return require('./path.svg')
    }
  }

  get selected () {
    return editorState.insertMode === this.type
  }

  constructor (public type: RectToolType) {
  }

  onClick () {
    editorState.insertMode = this.type
  }
}
