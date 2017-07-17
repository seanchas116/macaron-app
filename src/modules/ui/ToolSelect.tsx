import * as React from 'react'
import { observer } from 'mobx-react'
import * as classNames from 'classnames'
import { Tool, toolManager } from '../tool'
import { CSSVariables } from '../../util/components/CSSVariables'
const styles = require('./ToolSelect.css')

const ToolSelectItem = observer((props: {tool: Tool}) => {
  const {tool} = props
  // using absolute path as workaround of https://bugs.chromium.org/p/chromium/issues/detail?id=618165
  return <CSSVariables icon={`url(http://${location.host}${tool.icon})`}>
    <div className={classNames(styles.item, {[styles.itemSelected]: tool.selected})} onClick={() => tool.onClick()} />
  </CSSVariables>
})

@observer
export
class ToolSelect extends React.Component<{}, {}> {
  render () {
    const {toolOrder} = toolManager
    const tools = toolOrder.map(id => toolManager.tools.get(id))
    return <div className={styles.ToolSelect}>
      {tools.map(tool => tool && <ToolSelectItem tool={tool} key={tool.id} />)}
    </div>
  }
}
