import { observable, computed } from 'mobx'
import { Tool } from './Tool'

export
class ToolManager {
  tools = new Map<string, Tool>()
  readonly toolOrder = observable<string>([])
  @observable currentId: string|undefined

  @computed get current () {
    if (this.currentId) {
      return this.tools.get(this.currentId)
    }
  }

  add (tool: Tool) {
    this.tools.set(tool.id, tool)
  }
}

export const toolManager = new ToolManager()
