import * as React from 'react'
import {observer} from 'mobx-react'
import {snapper} from './Snapper'

@observer
export class SnapLines extends React.Component<{}, {}> {
  render () {
    return <g pointerEvents='none'>
      {snapper.lines.map((line, i) => <line key={i} stroke='blue' x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} />)}
    </g>
  }
}
