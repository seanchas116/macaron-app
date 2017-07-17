import { ItemData } from '../document'

export const clipboardDataType = 'com.sketchglass.macaron'

export interface ClipboardData {
  items?: ItemData[]
}
