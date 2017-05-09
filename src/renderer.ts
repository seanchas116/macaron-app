const nbind = require('nbind')
const {app} = require('electron').remote
const {lib} = nbind.init(app.getAppPath())

// testing nbind
// TODO: remove
console.log(lib.sayHello('you'))

import './modules'
import './init'
