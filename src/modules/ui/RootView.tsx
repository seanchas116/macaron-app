import * as React from 'react'
import {action} from 'mobx'
import {ToolSelect} from './ToolSelect'
import {ItemHierarchy} from './ItemHierarchy'
import {Inspector} from './Inspector'
import {DrawArea, toolManager} from '../drawarea'
import {documentManager, CompositeCommand, ItemRemoveCommand} from '../document'
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
    if (toolManager.current) {
      toolManager.current.onKeyDown(e)
      if (e.defaultPrevented) {
        return
      }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.removeItems()
    }
  }

  private removeItems () {
    const {document} = documentManager
    const commands = [...document.selectedItems].map(item => new ItemRemoveCommand(item))
    document.history.push(new CompositeCommand('Delete Items', commands))
  }
}
