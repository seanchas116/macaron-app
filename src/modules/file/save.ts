import * as fs from 'fs'
import * as temp from 'temp'
import * as JSZip from 'jszip'
import * as msgpack from 'msgpack-lite'
import { Document, packItems } from '../document'
import { DocumentData } from './DocumentData'

export async function save (document: Document, filePath: string) {
  const zip = new JSZip()

  const pagePath = '/page1.msgpack'

  const documentData: DocumentData = {
    version: 1,
    scrollX: document.scroll.x,
    scrollY: document.scroll.y,
    selectedItemIds: [...document.selectedItems].map(item => item.id),
    pages: [
      {
        name: 'Page 1',
        path: pagePath
      }
    ]
  }
  zip.file('document.msgpack', msgpack.encode(documentData))

  const pageData = msgpack.encode(packItems(document.rootItem.children))
  zip.file(pagePath, pageData)

  const tempPath = temp.path()
  const zipData = await zip.generateAsync({type: 'nodebuffer'})
  await new Promise((resolve, reject) => {
    fs.writeFile(tempPath, zipData, err => err ? reject(err) : resolve())
  })
  await new Promise((resolve, reject) => {
    fs.rename(tempPath, filePath, err => err ? reject(err) : resolve())
  })

  document.filePath = filePath
}
