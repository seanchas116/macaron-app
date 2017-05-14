interface Native {
  clearClipboard (): void
  setClipboardData (type: string, data: Buffer): void
  getClipboardData (type: string): Buffer|undefined
}
const native: Native = require('bindings')('native.node')
export = native
