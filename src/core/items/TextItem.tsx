import * as React from 'react'
import {Vec2} from 'paintvec'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import {autobind} from 'core-decorators'
import {Item} from './Item'
import {Movable} from '../drawarea/Movable'

@observer
class TextItemComponent extends React.Component<{item: TextItem}, {}> {
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

export
class TextItem extends Item {
  @observable position = new Vec2()
  @observable size = new Vec2()
  name = 'Text'
  @observable text = 'Text'

  render (): JSX.Element {
    return <TextItemComponent item={this} />
  }

  clone () {
    const cloned = new TextItem(this.document)
    this.copyPropsFrom(cloned)
    return cloned
  }

  copyPropsFrom (other: TextItem) {
    super.copyPropsFrom(other)
    other.size = this.size
  }
}
