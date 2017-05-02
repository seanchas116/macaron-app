import * as React from 'react'
import {action} from 'mobx'
import {ToolSelect} from './ToolSelect'
import {ItemHierarchy} from './ItemHierarchy'
import {Inspector} from './Inspector'
import {DrawArea} from '../drawarea/DrawArea'
import {documentManager} from '../DocumentManager'
import {isTextInput} from '../../util/isTextInput'
const styles = require('./RootView.css')

export
class RootView extends React.Component<{}, {}> {
  render () {
    return (
      <div className={styles.RootView} tabIndex={-1} onKeyDown={this.onKeyDown}>
        <ToolSelect />
        <ItemHierarchy />
        <DrawArea />
        <Inspector />
      </div>
    )
  }

  @action private onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isTextInput(document.activeElement)) {
      return
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      documentManager.document.deleteItems()
    }
  }
}
