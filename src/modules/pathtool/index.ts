import { PathTool } from './PathTool'
import { toolManager } from '../drawarea'

toolManager.add(new PathTool())

if (module.hot) {
  module.hot.accept()
}
