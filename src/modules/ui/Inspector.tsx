import * as React from 'react'
import {observer} from 'mobx-react'
import {Rect} from 'paintvec'
import {documentManager, ItemChangeCommand} from '../document'
const styles = require('./Inspector.css')

interface ValueInputProps {
  value: number
  onChange: (value: number) => void
}

class ValueInput extends React.Component<ValueInputProps, {}> {
  private element: HTMLInputElement

  componentDidMount () {
    this.element.value = String(this.props.value)
  }

  componentWillReceiveProps (props: ValueInputProps) {
    this.element.value = String(props.value)
  }

  render () {
    return <input type='number' ref={e => this.element = e} onKeyDown={this.onKeyDown} onBlur={this.onBlur} />
  }

  private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.commit()
    } else if (e.key === 'Escape') {
      this.element.value = String(this.props.value)
    }
  }

  private onBlur = () => {
    this.commit()
  }

  private commit () {
      // TODO: evaluate string as expression
    const newValue = parseFloat(this.element.value)
    if (this.props.value !== newValue) {
      this.props.onChange(newValue)
    }
  }
}

function ColorInput (props: {value: string, onChange: (value: string) => void}) {
  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    props.onChange(e.currentTarget.value)
  }
  return <input type='color' value={props.value} onChange={onChange} />
}

@observer
export class Inspector extends React.Component<{}, {}> {
  render () {
    const {document} = documentManager
    const item = [...document.selectedItems][0]
    if (!item) {
      return <div className={styles.root} />
    }

    const onChangeRect = (title: string, rect: Rect) => {
      document.history.push(new ItemChangeCommand(title, item, {rect}))
    }
    const onChangeFill = (fill: string) => {
      document.history.push(new ItemChangeCommand('Change Fill', item, {fill}))
    }
    const onChangeStroke = (stroke: string) => {
      document.history.push(new ItemChangeCommand('Change Stroke', item, {stroke}))
    }
    const onChangeStrokeWidth = (strokeWidth: number) => {
      document.history.push(new ItemChangeCommand('Change Stroke Width', item, {strokeWidth}))
    }

    const {left, top, width, height} = item.rect
    return <div className={styles.root}>
      <div className={styles.rect} >
        <label>X</label>
        <ValueInput value={left} onChange={left => onChangeRect('Change X', Rect.fromWidthHeight(left, top, width, height))} />
        <label>Y</label>
        <ValueInput value={top} onChange={top => onChangeRect('Change Y', Rect.fromWidthHeight(left, top, width, height))} />
        <label>W</label>
        <ValueInput value={width} onChange={width => onChangeRect('Change Width', Rect.fromWidthHeight(left, top, width, height))} />
        <label>H</label>
        <ValueInput value={height} onChange={height => onChangeRect('Change Height', Rect.fromWidthHeight(left, top, width, height))} />
      </div>
      <div className={styles.fill}>
        <label><input type='checkbox' />Fill</label>
        <ColorInput value={item.fill} onChange={onChangeFill} />
      </div>
      <div className={styles.stroke}>
        <label><input type='checkbox' />Border</label>
        <ColorInput value={item.stroke} onChange={onChangeStroke} />
        <ValueInput value={item.strokeWidth} onChange={onChangeStrokeWidth} />
      </div>
    </div>
  }
}
