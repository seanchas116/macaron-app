const nbind = require('nbind')
const {app} = require('electron').remote
export const {Clipboard} = nbind.init(app.getAppPath()).lib
