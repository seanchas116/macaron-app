import * as React from 'react'
import {observer} from 'mobx-react'
import {Rect} from 'paintvec'
import {documentManager} from '../document/DocumentManager'
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
      this.props.onChange(parseFloat(this.element.value))
    } else if (e.key === 'Escape') {
      this.element.value = String(this.props.value)
    }
  }

  private onBlur = () => {
    this.props.onChange(parseFloat(this.element.value))
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
    const {left, top, width, height} = item.rect
    return <div className={styles.root}>
      <div className={styles.rect} >
        <ValueInput value={left} onChange={left => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
        <ValueInput value={top} onChange={top => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
        <div className={styles.rectLabel}>X</div>
        <div className={styles.rectLabel}>Y</div>
        <ValueInput value={width} onChange={width => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
        <ValueInput value={height} onChange={height => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
        <div className={styles.rectLabel}>Width</div>
        <div className={styles.rectLabel}>Height</div>
      </div>
      <div className={styles.fill}>
        <div className={styles.fillTitle}>Fill</div>
        <ColorInput value={item.fill} onChange={fill => item.fill = fill} />
      </div>
      <div className={styles.stroke}>
        <div className={styles.strokeTitle}>Stroke</div>
        <ColorInput value={item.stroke} onChange={stroke => item.stroke = stroke} />
        <ValueInput value={item.strokeWidth} onChange={width => item.strokeWidth = width} />
      </div>
    </div>
  }
}
