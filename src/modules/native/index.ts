const nbind = require('nbind')
const {app} = require('electron').remote
const {lib} = nbind.init(app.getAppPath())

export interface Clipboard {
  clear (): void
  setData (type: string, data: Buffer): void
  getData (type: string): Buffer|undefined
}

interface ClipboardCtor {
  new (): Clipboard
}

export const Clipboard: ClipboardCtor = lib.Clipboard
