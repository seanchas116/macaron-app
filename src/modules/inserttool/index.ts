import { InsertTool } from './InsertTool'
import { toolManager } from '../tool'

toolManager.add(new InsertTool('rect'))
toolManager.add(new InsertTool('oval'))
toolManager.add(new InsertTool('text'))
toolManager.add(new InsertTool('path'))

if (module.hot) {
  module.hot.accept()
}
