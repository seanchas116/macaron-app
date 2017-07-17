import * as React from 'react'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react'
import { Vec2 } from 'paintvec'
import { documentManager, PathItem } from '../document'
import { toolManager } from './ToolManager'
import { ItemResizeHandles } from './ItemResizeHandles'
import { PathEditor } from './PathEditor'
import { SnapLines } from './SnapLines'
import { GroupItemView } from './GroupItemView'
const styles = require('./DrawArea.css')

@observer
export class DrawArea extends React.Component<{}, {}> {
  private static clientRect: ClientRect|undefined

  private root: HTMLElement
  private resizeObserver: any
  @observable private size = new Vec2(0, 0)

  static posFromEvent (event: {clientX: number, clientY: number}) {
    const {scroll} = documentManager.document
    if (this.clientRect) {
      return new Vec2(event.clientX - this.clientRect.left + scroll.x, event.clientY - this.clientRect.top + scroll.y)
    }
    return new Vec2()
  }

  componentDidMount () {
    this.resizeSVG()
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeSVG()
    })
    this.resizeObserver.observe(this.root)
  }

  componentWillUnmount () {
    this.resizeObserver.unobserve(this.root)
  }

  render () {
    const {rootItem, selectedItems, scroll, focusedItem} = documentManager.document
    const currentTool = toolManager.current
    const {width, height} = this.size
    // TODO: improve scroll performance
    return <div className={styles.root} ref={e => this.root = e!}>
      <svg className={styles.svg} width={width + 'px'} height={height + 'px'} onWheel={this.onWheel} >
        <rect x={0} y={0} width={width} height={height} onClick={this.deselect} fill='white' />
        <g transform={`translate(${-scroll.x}, ${-scroll.y})`} >
          <GroupItemView item={rootItem} />
          <SnapLines />
          {!focusedItem && <ItemResizeHandles items={[...selectedItems]} />}
        </g>
        {focusedItem instanceof PathItem && <PathEditor item={focusedItem} width={width} height={height} />}
        {currentTool && currentTool.renderOverlay(this.size)}
      </svg>
    </div>
  }

  @action deselect = () => {
    documentManager.document.deselectItems()
  }

  @action private resizeSVG () {
    const clientRect = this.root.getBoundingClientRect()
    DrawArea.clientRect = clientRect
    this.size = new Vec2(clientRect.width, clientRect.height)
  }

  @action private onWheel = (event: React.WheelEvent<SVGElement>) => {
    const {document} = documentManager
    document.scroll = document.scroll.add(new Vec2(event.deltaX, event.deltaY)).round()
  }
}
