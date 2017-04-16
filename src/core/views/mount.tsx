import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {RootView} from './RootView'

ReactDOM.render(<RootView />, document.getElementById('root'))

if (module.hot) {
  module.hot.accept()
}
