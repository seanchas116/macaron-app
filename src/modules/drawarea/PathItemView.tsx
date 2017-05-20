import * as React from 'react'
import {observer} from 'mobx-react'
import {PathItem} from '../document'
import {Movable} from './Movable'
import {itemPreview} from './ItemPreview'

@observer
export class PathItemView extends React.Component<{item: PathItem}, {}> {
  render () {
    const {item} = this.props
    const preview = itemPreview.previewItem(item)
    const fill = preview.fillEnabled ? preview.fill : 'none'
    const stroke = preview.strokeEnabled ? preview.stroke : 'none'
    const {strokeWidth, edges} = preview

    const pathStrs = [`M ${edges[0].position.x} ${edges[0].position.y}`]
    for (let i = 1; i < edges.length; ++i) {
      const edge = edges[i]
      const {x, y} = edge.position
      if (edge.type === 'straight') {
        pathStrs.push(`L ${x} ${y}`)
      } else {
        const {x: x1, y: y1} = edges[i - 1].handles[1]
        const {x: x2, y: y2} = edges[i].handles[0]
        pathStrs.push(`C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`)
      }
    }
    const pathStr = pathStrs.join(' ')

    return <Movable item={item} key={item.id}>
      <path
        d={pathStr}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Movable>
  }
}
