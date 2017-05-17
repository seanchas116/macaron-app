import * as React from 'react'
import {action} from 'mobx'
import {Vec2} from 'paintvec'
import {PointerEvents} from '../../util/components/PointerEvents'

export
class PathToolOverlay extends React.Component<{size: Vec2}, {}> {
  private onPointerDown = action((event: PointerEvent) => {
    // TODO
  })

  private onPointerMove = action((event: PointerEvent) => {
    // TODO
  })

  private onPointerUp = action((event: PointerEvent) => {
    // TODO
  })

  render () {
    const {width, height} = this.props.size
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
    >
      <rect width={width} height={height} fill='transparent' />
    </PointerEvents>
  }
}
