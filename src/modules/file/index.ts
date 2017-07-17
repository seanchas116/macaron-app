import './actions/FileNewAction'
import './actions/FileOpenAction'
import './actions/FileSaveAction'
import './actions/FileSaveAsAction'

import * as qs from 'querystring'
import { open } from './open'
import { documentManager } from '../document'

async function openFileFromHash () {
  if (location.hash) {
    const opts = qs.parse(location.hash.slice(1))
    if (opts.filePath) {
      console.log('loadng file...')
      documentManager.document = await open(opts.filePath)
    }
  }
}

openFileFromHash()
