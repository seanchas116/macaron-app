import * as React from 'react'
import {observer} from 'mobx-react'
import {PathItem} from '../document'
import {itemPreview} from './ItemPreview'

@observer
export class PathHandles extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)

    const handles: JSX.Element[] = []
    for (const edge of preview.edges) {
      const {position: p, handles: [h1, h2]} = edge
      handles.push(
        <line x1={p.x} y1={p.y} x2={h1.x} y2={h1.y} stroke='lightgray' />,
        <line x1={p.x} y1={p.y} x2={h2.x} y2={h2.y} stroke='lightgray' />,
        <circle cx={p.x} cy={p.y} r={3} fill='white' stroke='grey' />,
        <circle cx={h1.x} cy={h1.y} r={2} fill='white' stroke='grey' />,
        <circle cx={h2.x} cy={h2.y} r={2} fill='white' stroke='grey' />
      )
    }

    return <g>{...handles}</g>
  }
}
