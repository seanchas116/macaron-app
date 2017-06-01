import * as React from 'react'
import {action} from 'mobx'
import {observer} from 'mobx-react'
import {PathItem} from '../document'
import {itemPreview} from './ItemPreview'
import {PointerEvents} from '../../util/components/PointerEvents'

@observer
class PathNodeHandle extends React.Component<{item: PathItem, index: number}, {}> {
  @action onPointerDown = (event: PointerEvent) => {
    // TODO
  }
  @action onPointerMove = (event: PointerEvent) => {
    // TODO
  }
  @action onPointerUp = (event: PointerEvent) => {
    // TODO
  }

  render () {
    const {item, index} = this.props
    const preview = itemPreview.previewItem(item)
    const node = preview.nodes[index]
    const p = preview.transformPos(node.position)
    const h1 = preview.transformPos(node.handle1)
    const h2 = preview.transformPos(node.handle2)
    if (node.type === 'straight') {
      return <g>
        <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
      </g>
    } else {
      return <PointerEvents
        onPointerDown={this.onPointerDown}
        onPointerMove={this.onPointerMove}
        onPointerUp={this.onPointerUp} >
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
      {preview.nodes.map((n, i) => <PathNodeHandle item={item} index={i} key={i} />)}
    </g>
  }
}
