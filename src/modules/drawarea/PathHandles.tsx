import * as React from 'react'
import {observer} from 'mobx-react'
import {PathItem, PathNode} from '../document'
import {itemPreview} from './ItemPreview'
import {PointerEvents} from '../../util/components/PointerEvents'

@observer
class PathNodeHandle extends React.Component<{node: PathNode}, {}> {
  render () {
    const {position: p, handle1: h1, handle2: h2, type} = this.props.node
    if (type === 'straight') {
      return <g>
        <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
      </g>
    } else {
      return <PointerEvents>
        <g>
          <line x1={p.x} y1={p.y} x2={h1.x} y2={h1.y} stroke='lightgray' />
          <line x1={p.x} y1={p.y} x2={h2.x} y2={h2.y} stroke='lightgray' />
          <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
          <circle cx={h1.x} cy={h1.y} r={2} fill='white' stroke='grey' />
          <circle cx={h2.x} cy={h2.y} r={2} fill='white' stroke='grey' />
        </g>
      </PointerEvents>
    }
  }
}

@observer
export class PathHandles extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)

    return <g>
      {preview.nodes.map((n, i) => <PathNodeHandle node={n} key={i} />)}
    </g>
  }
}