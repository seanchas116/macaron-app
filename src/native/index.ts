interface Native {
  openClipboard (windowHandle: Buffer): void
  clearClipboard (): void
  setClipboardData (type: string, data: Buffer): void
  getClipboardData (type: string): Buffer|undefined
  closeClipboard (): void
}
const native: Native = require('bindings')('native.node')
export = native
