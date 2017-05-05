import {observable} from 'mobx'
import {Tool} from './Tool'

export
class ToolManager {
  readonly tools = observable<Tool>([])
  @observable current: Tool|undefined
  add (tool: Tool) {
    this.tools.push(tool)
  }
}

export const toolManager = new ToolManager()
