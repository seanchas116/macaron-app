import * as React from 'react'
import {ToolSelect} from './ToolSelect'
import {ItemHierarchy} from './ItemHierarchy'
import {DrawArea} from './DrawArea'
const styles = require('./RootView.css')

export
class RootView extends React.Component<{}, {}> {
  render () {
    return (
      <div className={styles.RootView}>
        <ToolSelect />
        <ItemHierarchy />
        <DrawArea />
      </div>
    )
  }
}
