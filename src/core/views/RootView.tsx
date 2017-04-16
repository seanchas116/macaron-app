import * as React from 'react'
import {ToolSelect} from './ToolSelect'
import {DrawArea} from './DrawArea'
const styles = require('./RootView.css')

export
class RootView extends React.Component<{}, {}> {
  render () {
    return (
      <div className={styles.RootView}>
        <ToolSelect />
        <DrawArea />
      </div>
    )
  }
}
