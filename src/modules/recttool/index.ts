import {RectTool} from './RectTool'
import {toolManager} from '../drawarea/ToolManager'

toolManager.add(new RectTool('rect'))
toolManager.add(new RectTool('oval'))
toolManager.add(new RectTool('text'))