import * as React from 'react'
import {Rect} from 'paintvec'
import {Alignment} from '../../util/Types'

export const SizeLabel = (props: {rect: Rect, draggedHandle: [Alignment, Alignment]}) => {
  const {rect, draggedHandle} = props
  const {width, height, left, top, right, bottom} = rect
  const style = {fontSize: '12px'}
  let widthLabel: JSX.Element
  let heightLabel: JSX.Element

  if (draggedHandle[1] === 'begin') {
    widthLabel = <text
      textAnchor='middle'
      x={(left + right) / 2} y={top - 8}
      fill='blue' style={style}>
      {width}
    </text>
  } else {
    widthLabel = <text
      textAnchor='middle'
      x={(left + right) / 2} y={bottom + 16}
      fill='blue' style={style}>
      {width}
    </text>
  }

  if (draggedHandle[0] === 'begin') {
    heightLabel = <text
      textAnchor='end'
      x={left - 8} y={(top + bottom) / 2}
      fill='blue' style={style}>
      {height}
    </text>
  } else {
    heightLabel = <text
      x={right + 8} y={(top + bottom) / 2}
      fill='blue' style={style}>
      {height}
    </text>
  }
  return <g>{widthLabel}{heightLabel}</g>
}
