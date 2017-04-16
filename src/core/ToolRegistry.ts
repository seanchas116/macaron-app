import {observable} from 'mobx'
import {Tool} from './Tool'

export
class ToolRegistry {
  tools = observable<Tool>([])
  @observable current: Tool|undefined
  add (tool: Tool) {
    this.tools.push(tool)
  }
}

export const toolRegistry = new ToolRegistry()
