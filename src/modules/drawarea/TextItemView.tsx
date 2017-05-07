import * as React from 'react'
import {observable, action, reaction} from 'mobx'
import {observer} from 'mobx-react'
import {autobind} from 'core-decorators'
import {Movable} from './Movable'
import {TextItem} from '../document/TextItem'
import {itemPreview} from './ItemPreview'

@observer
export
class TextItemView extends React.Component<{item: TextItem}, {}> {
  @observable private focus = false
  private editor: HTMLElement|undefined

  constructor () {
    super()
    reaction(() => this.focus, focus => {
      if (this.editor) {
        if (focus) {
          this.editor.focus()
        } else {
          this.editor.blur()
        }
      }
    })
  }

  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const {x, y} = preview.position
    const {width, height} = preview.size
    return <Movable movable={!this.focus} item={item}>
      <foreignObject
        x={x} y={y} width={width} height={height}
        onDoubleClick={this.onDoubleClick}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            cursor: this.focus ? 'text' : 'move',
            outline: 'none'
          }}
          contentEditable={this.focus} suppressContentEditableWarning
          tabIndex={-1}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          ref={e => this.editor = e}>
          {item.text}
        </div>
      </foreignObject>
    </Movable>
  }

  @autobind @action onDoubleClick () {
    this.focus = true
  }
  @autobind @action onBlur () {
    this.focus = false
  }
  @autobind @action onKeyDown (e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') {
      this.focus = false
    }
  }
}
