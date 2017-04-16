import * as React from 'react'
import {observer} from 'mobx-react'
import {documentManager} from '../DocumentManager'
const styles = require('./DrawArea.css')

declare var ResizeObserver: any

@observer
export class DrawArea extends React.Component<{}, {}> {
  private root: HTMLElement
  private svg: SVGSVGElement

  componentDidMount () {
    this.resizeSVG()
    const resizeObserver = new ResizeObserver(() => {
      this.resizeSVG()
    })
    resizeObserver.observe(this.root)
  }

  resizeSVG () {
    const {width, height} = this.root.getBoundingClientRect()
    this.svg.setAttribute('width', Math.round(width) + 'px')
    this.svg.setAttribute('height', Math.round(height) + 'px')
  }

  render () {
    const {items} = documentManager.document
    return <div className={styles.root} ref={e => this.root = e}>
      <svg ref={e => this.svg = e}>
        {items.map(item => item.render())}
      </svg>
    </div>
  }
}
