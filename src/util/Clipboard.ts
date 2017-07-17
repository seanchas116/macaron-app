import { remote } from 'electron'
import { openClipboard, clearClipboard, setClipboardData, getClipboardData, closeClipboard } from '../native'

export class Clipboard {
  constructor () {
    openClipboard(remote.getCurrentWindow().getNativeWindowHandle())
  }

  clear () {
    clearClipboard()
  }

  setData (type: string, data: Buffer) {
    setClipboardData(type, data)
  }

  getData (type: string) {
    return getClipboardData(type)
  }

  close () {
    closeClipboard()
  }
}
