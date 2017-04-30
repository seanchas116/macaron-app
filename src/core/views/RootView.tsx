import * as React from 'react'
import {action} from 'mobx'
import {ToolSelect} from './ToolSelect'
import {ItemHierarchy} from './ItemHierarchy'
import {DrawArea} from '../drawarea/DrawArea'
import {documentManager} from '../DocumentManager'
const styles = require('./RootView.css')

export
class RootView extends React.Component<{}, {}> {
  render () {
    return (
      <div className={styles.RootView} tabIndex={-1} onKeyDown={this.onKeyDown}>
        <ToolSelect />
        <ItemHierarchy />
        <DrawArea />
      </div>
    )
  }

  @action private onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      documentManager.document.deleteItems()
    }
  }
}
