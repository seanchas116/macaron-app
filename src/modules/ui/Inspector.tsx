import * as React from 'react'
import {observer} from 'mobx-react'
import {Rect} from 'paintvec'
import {documentManager, ItemChangeCommand, Item} from '../document'
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

const ColorInput = (props: {value: string, onChange: (value: string) => void}) => {
  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    props.onChange(e.currentTarget.value)
  }
  return <input type='color' value={props.value} onChange={onChange} />
}

const CheckboxInput = (props: {value: boolean, onChange: (value: boolean) => void}) => {
  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    props.onChange(e.currentTarget.checked)
  }
  return <input type='checkbox' checked={props.value} onChange={onChange} />
}


const RectEdit = observer((props: {item: Item}) => {
  const {item} = props
  const {left, top, width, height} = item.rect
  const {history} = documentManager.document

  const onChangeRect = (title: string, rect: Rect) => {
    history.push(new ItemChangeCommand(title, item, {rect}))
  }

  return <div className={styles.rect} >
    <label>X</label>
    <ValueInput value={left} onChange={left => onChangeRect('Change X', Rect.fromWidthHeight(left, top, width, height))} />
    <label>Y</label>
    <ValueInput value={top} onChange={top => onChangeRect('Change Y', Rect.fromWidthHeight(left, top, width, height))} />
    <label>W</label>
    <ValueInput value={width} onChange={width => onChangeRect('Change Width', Rect.fromWidthHeight(left, top, width, height))} />
    <label>H</label>
    <ValueInput value={height} onChange={height => onChangeRect('Change Height', Rect.fromWidthHeight(left, top, width, height))} />
  </div>
})

const FillEdit = observer((props: {item: Item}) => {
  const {item} = props
  const {history} = documentManager.document
  const onChangeFill = (fill: string) => {
    history.push(new ItemChangeCommand('Change Fill', item, {fill}))
  }
  const onChangeFillEnabled = (fillEnabled: boolean) => {
    const title = fillEnabled ? 'Enable Fill' : 'Disable Fill'
    history.push(new ItemChangeCommand(title, item, {fillEnabled}))
  }
  return <div className={styles.fill}>
    <label><CheckboxInput value={item.fillEnabled} onChange={onChangeFillEnabled} />Fill</label>
    <ColorInput value={item.fill} onChange={onChangeFill} />
  </div>
})

const StrokeEdit = observer((props: {item: Item}) => {
  const {item} = props
  const {history} = documentManager.document
  const onChangeStroke = (stroke: string) => {
    history.push(new ItemChangeCommand('Change Stroke', item, {stroke}))
  }
  const onChangeStrokeWidth = (strokeWidth: number) => {
    history.push(new ItemChangeCommand('Change Stroke Width', item, {strokeWidth}))
  }
  const onChangeStrokeEnabled = (strokeEnabled: boolean) => {
    const title = strokeEnabled ? 'Enable Border' : 'Disable Border'
    history.push(new ItemChangeCommand(title, item, {strokeEnabled}))
  }
  return <div className={styles.stroke}>
    <label><CheckboxInput value={item.strokeEnabled} onChange={onChangeStrokeEnabled} />Border</label>
    <ColorInput value={item.stroke} onChange={onChangeStroke} />
    <ValueInput value={item.strokeWidth} onChange={onChangeStrokeWidth} />
  </div>
})


@observer
export class Inspector extends React.Component<{}, {}> {
  render () {
    const {document} = documentManager
    const item = [...document.selectedItems][0]
    if (!item) {
      return <div className={styles.root} />
    }

    return <div className={styles.root}>
      <RectEdit item={item} />
      <FillEdit item={item} />
      <StrokeEdit item={item} />
    </div>
  }
}
