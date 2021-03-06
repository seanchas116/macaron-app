import { RectTool } from './RectTool'
import { toolManager } from '../drawarea'

toolManager.add(new RectTool('rect'))
toolManager.add(new RectTool('oval'))
toolManager.add(new RectTool('text'))
toolManager.add(new RectTool('frame'))

if (module.hot) {
  module.hot.accept()
}
