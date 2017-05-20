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
        <circle cx={p.x} cy={p.y} rx={3} ry={3} fill='white' stroke='grey' />,
        <circle cx={h1.x} cy={h1.y} rx={2} ry={2} fill='white' stroke='grey' />,
        <circle cx={h2.x} cy={h2.y} rx={2} ry={2} fill='white' stroke='grey' />
      )
    }

    return <g>{...handles}</g>
  }
}
