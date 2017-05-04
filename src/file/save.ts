import * as fs from 'fs'
import {createConnection} from 'typeorm'
import * as temp from 'temp'
import {Document} from '../core/Document'
import {ItemModel} from './ItemModel'

export async function save (document: Document, filePath: string) {
  const tempPath = temp.path()
  const connection = await createConnection({
    driver: {
      type: 'sqlite',
      storage: tempPath
    },
    entities: [
      ItemModel
    ],
    autoSchemaSync: true
  })
  const itemModels: ItemModel[] = []
  document.rootItem.forEachDescendant(item => {
    if (item === document.rootItem) {
      return
    }
    const model = new ItemModel()
    model.id = item.id
    model.parentId = item.parent && item.parent.id
    model.data = item.toData()
    itemModels.push(model)
  })
  await connection.entityManager.persist(itemModels)
  await new Promise((resolve, reject) => {
    fs.rename(tempPath, filePath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
