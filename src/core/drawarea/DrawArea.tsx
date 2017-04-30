import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import {Vec2} from 'paintvec'
import {autobind} from 'core-decorators'
import {documentManager} from '../DocumentManager'
import {toolManager} from '../ToolManager'
import {ItemResizeHandles} from './ItemResizeHandles'
import {SnapLines} from './SnapLines'
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
    const {rootItem, selectedItems} = documentManager.document
    const currentTool = toolManager.current
    const {width, height} = this.size
    return <div className={styles.root} ref={e => this.root = e}>
      <svg className={styles.svg} width={width + 'px'} height={height + 'px'}>
        <rect x={0} y={0} width={width} height={height} onClick={this.deselect} fill='white' />
        {rootItem.render()}
        <SnapLines />
        {[...selectedItems].map(item => <ItemResizeHandles item={item} key={item.id} />)}
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
}
