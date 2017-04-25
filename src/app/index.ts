import {RectTool} from './tools/rect/RectTool'
import {toolManager} from '../core/ToolManager'

toolManager.add(new RectTool('rect'))
toolManager.add(new RectTool('oval'))
toolManager.add(new RectTool('text'))
