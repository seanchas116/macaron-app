import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import {Vec2} from 'paintvec'
import {documentManager} from '../DocumentManager'
import {toolManager} from '../ToolManager'
const styles = require('./DrawArea.css')

declare var ResizeObserver: any

@observer
export class DrawArea extends React.Component<{}, {}> {
  private root: HTMLElement
  @observable private size = new Vec2(0, 0)

  componentDidMount () {
    this.resizeSVG()
    const resizeObserver = new ResizeObserver(() => {
      this.resizeSVG()
    })
    resizeObserver.observe(this.root)
  }

  render () {
    const {items} = documentManager.document
    const currentTool = toolManager.current
    const {width, height} = this.size
    return <div className={styles.root} ref={e => this.root = e}>
      <svg className={styles.svg} width={width + 'px'} height={height + 'px'}>
        {items.map(item => item.render())}
        {currentTool && currentTool.renderOverlay(this.size)}
      </svg>
    </div>
  }

  @action private resizeSVG () {
    const {width, height} = this.root.getBoundingClientRect()
    this.size = new Vec2(width, height)
  }
}
