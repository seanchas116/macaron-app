import * as React from 'react'
import {Vec2} from 'paintvec'
import {PointerEvents} from '../../../util/components/PointerEvents'

const handleSize = 6

interface ResizeHandleProps {
  x: number
  y: number
  onChangeBegin: () => void
  onChange: (x: number, y: number) => void
  onChangeEnd: () => void
}

class ResizeHandle extends React.Component<ResizeHandleProps, {}> {
  private dragged = false
  private origX = 0
  private origY = 0
  private origClientX = 0
  private origClientY = 0

  render () {
    const {x, y} = this.props
    return <PointerEvents
      onPointerDown={this.onPointerDown}
      onPointerMove={this.onPointerMove}
      onPointerUp={this.onPointerUp}
    >
      <rect
        x={x - handleSize / 2} y={y - handleSize / 2}
        width={handleSize} height={handleSize}
        onClick={e => e.stopPropagation()}
        stroke='grey'
        fill='white'
      />
    </PointerEvents>
  }

  private onPointerDown = (e: PointerEvent) => {
    this.dragged = true
    this.origX = this.props.x
    this.origY = this.props.y
    this.origClientX = e.clientX
    this.origClientY = e.clientY
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    this.props.onChangeBegin()
  }
  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragged) {
      return
    }
    const x = e.clientX - this.origClientX + this.origX
    const y = e.clientY - this.origClientY + this.origY
    this.props.onChange(x, y)
  }
  private onPointerUp = (e: PointerEvent) => {
    this.dragged = false
    this.props.onChangeEnd()
  }
}

interface ResizeHandlesProps {
  p1: Vec2
  p2: Vec2
  onChangeBegin: () => void
  onChange: (p1: Vec2, p2: Vec2) => void
  onChangeEnd: () => void
}

export
class ResizeHandles extends React.Component<ResizeHandlesProps, {}> {
  render () {
    const x1 = this.props.p1.x
    const y1 = this.props.p1.y
    const x2 = this.props.p2.x
    const y2 = this.props.p2.y
    const x = Math.min(x1, x2)
    const width = Math.max(x1, x2) - x
    const y = Math.min(y1, y2)
    const height = Math.max(y1, y2) - y
    const {onChange, onChangeBegin, onChangeEnd} = this.props
    return <g>
      <rect x={x} y={y} width={width} height={height} stroke='lightgrey' fill='transparent' pointerEvents='none' />
      <ResizeHandle
        x={x1} y={y1}
        onChange={(x1, y1) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={(x1 + x2) / 2} y={y1}
        onChange={(_, y1) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={x2} y={y1}
        onChange={(x2, y1) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={x2} y={(y1 + y2) / 2}
        onChange={(x2, _) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={x2} y={y2}
        onChange={(x2, y2) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={(x1 + x2) / 2} y={y2}
        onChange={(_, y2) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={x1} y={y2}
        onChange={(x1, y2) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
      <ResizeHandle
        x={x1} y={(y1 + y2) / 2}
        onChange={(x1, _) => onChange(new Vec2(x1, y1), new Vec2(x2, y2))}
        onChangeBegin={onChangeBegin} onChangeEnd={onChangeEnd}
      />
    </g>
  }
}
