import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import {Vec2} from 'paintvec'
import {autobind} from 'core-decorators'
import {documentManager, PathItem} from '../document'
import {toolManager} from './ToolManager'
import {ItemResizeHandles} from './ItemResizeHandles'
import {PathHandles} from './PathHandles'
import {SnapLines} from './SnapLines'
import {GroupItemView} from './GroupItemView'
import {drawAreaMode} from './DrawAreaMode'
const styles = require('./DrawArea.css')

@observer
export class DrawArea extends React.Component<{}, {}> {
  private root: HTMLElement
  private resizeObserver: any
  @observable private size = new Vec2(0, 0)

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
    const {rootItem, selectedItems, scroll} = documentManager.document
    const currentTool = toolManager.current
    const {width, height} = this.size
    const {itemToEdit} = drawAreaMode
    // TODO: improve scroll performance
    return <div className={styles.root} ref={e => this.root = e}>
      <svg className={styles.svg} width={width + 'px'} height={height + 'px'} onWheel={this.onWheel} >
        <rect x={0} y={0} width={width} height={height} onClick={this.deselect} fill='white' />
        <g transform={`translate(${-scroll.x}, ${-scroll.y})`} >
          <GroupItemView item={rootItem} />
          <SnapLines />
          <ItemResizeHandles items={[...selectedItems]} />
          {itemToEdit instanceof PathItem && <PathHandles item={itemToEdit} />}
        </g>
        {currentTool && currentTool.renderOverlay(this.size)}
      </svg>
    </div>
  }

  @autobind @action deselect () {
    documentManager.document.deselectItems()
  }

  @action private resizeSVG () {
    const {width, height} = this.root.getBoundingClientRect()
    this.size = new Vec2(width, height)
  }

  @autobind @action private onWheel (event: React.WheelEvent<SVGElement>) {
    const {document} = documentManager
    document.scroll = document.scroll.add(new Vec2(event.deltaX, event.deltaY)).round()
  }
}
