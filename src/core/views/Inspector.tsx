import * as React from 'react'
import {observer} from 'mobx-react'
import {Rect} from 'paintvec'
import {documentManager} from '../DocumentManager'
const styles = require('./Inspector.css')

function ValueInput (props: {value: number, onChange: (value: number) => void}) {
  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    props.onChange(parseFloat(e.currentTarget.value))
  }
  return <input type='number' value={props.value} onChange={onChange} />
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
      <ValueInput value={left} onChange={left => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
      <ValueInput value={top} onChange={top => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
      <ValueInput value={width} onChange={width => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
      <ValueInput value={height} onChange={height => item.rect = Rect.fromWidthHeight(left, top, width, height)} />
    </div>
  }
}
