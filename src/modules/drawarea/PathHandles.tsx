import * as React from 'react'
import {observer} from 'mobx-react'
import {PathItem, PathEdge} from '../document'
import {itemPreview} from './ItemPreview'

const PathHandle = (props: {edge: PathEdge}) => {
  const {position: p, handles: [h1, h2], type} = props.edge
  if (type === 'straight') {
    return <g>
      <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
    </g>
  } else {
    return <g>
      <line x1={p.x} y1={p.y} x2={h1.x} y2={h1.y} stroke='lightgray' />
      <line x1={p.x} y1={p.y} x2={h2.x} y2={h2.y} stroke='lightgray' />
      <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />
      <circle cx={h1.x} cy={h1.y} r={2} fill='white' stroke='grey' />
      <circle cx={h2.x} cy={h2.y} r={2} fill='white' stroke='grey' />
    </g>
  }
}

@observer
export class PathHandles extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)

    return <g>
      {preview.edges.map((e, i) => <PathHandle edge={e} key={i} />)}
    </g>
  }
}
