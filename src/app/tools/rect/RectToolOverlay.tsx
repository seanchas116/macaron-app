import * as React from 'react'
import {Vec2} from 'paintvec'

export
class RectToolOverlay extends React.Component<{size: Vec2}, {}> {
  render () {
    const {width, height} = this.props.size
    return <rect width={width} height={height} />
  }
}
