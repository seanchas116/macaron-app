import * as React from 'react'
import { observer } from 'mobx-react'
import { itemSnapper } from './ItemSnapper'

@observer
export class SnapLines extends React.Component<{}, {}> {
  render () {
    return <g pointerEvents='none'>
      {itemSnapper.lines.map(([p1, p2], i) => <line key={i} stroke='blue' x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />)}
    </g>
  }
}
