import * as React from 'react'
import {ToolSelect} from './ToolSelect'
const styles = require('./RootView.css')

export
class RootView extends React.Component<{}, {}> {
  render () {
    return (
      <div className={styles.RootView}>
        <ToolSelect />
      </div>
    )
  }
}
