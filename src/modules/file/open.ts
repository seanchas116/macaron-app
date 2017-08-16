import * as fs from 'fs'
import * as JSZip from 'jszip'
import * as msgpack from 'msgpack-lite'
import { action } from 'mobx'
import { Vec2 } from 'paintvec'
import { Document, unpackItems } from '../document'
import { DocumentData } from './DocumentData'

export const open = action(async (filePath: string) => {
  const fileData = await new Promise<Buffer>((resolve, reject) => {
    fs.readFile(filePath, (err, data) => err ? reject(err) : resolve(data))
  })
  const zip = new JSZip()
  await zip.loadAsync(fileData)

  // TODO: validate data
  const documentData: DocumentData = msgpack.decode(await zip.file('document.msgpack').async('nodebuffer'))
  const rootItemData = msgpack.decode(await zip.file(documentData.pages[0].path).async('nodebuffer'))

  const document = new Document()
  const items = unpackItems(document, rootItemData, {newID: false})
  for (const item of items) {
    document.rootItem.appendChild(item)
  }
  document.scroll = new Vec2(documentData.scrollX, documentData.scrollY)
  document.selectedItems.clear()
  for (const id of documentData.selectedItemIds) {
    const item = document.itemForId.get(id)
    if (item) {
      document.selectedItems.add(item)
    }
  }

  document.filePath = filePath
  return document
})
