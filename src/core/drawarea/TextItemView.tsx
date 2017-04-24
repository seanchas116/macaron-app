import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import {autobind} from 'core-decorators'
import {Movable} from './Movable'
import {TextItem} from '../items/TextItem'

@observer
export
class TextItemView extends React.Component<{item: TextItem}, {}> {
  @observable private focus = false

  render () {
    const {item} = this.props
    const {x, y} = item.position
    const {width, height} = item.size
    return <Movable movable={!this.focus} item={item} key={item.id}>
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
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}>
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
