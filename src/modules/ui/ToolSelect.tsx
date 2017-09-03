import * as React from 'react'
import { observer } from 'mobx-react'
import * as classNames from 'classnames'
import { Tool, toolManager } from '../drawarea'
const styles = require('./ToolSelect.css')

const ToolSelectItem = observer((props: {tool: Tool}) => {
  const {tool} = props
  const onClick = () => {
    toolManager.currentId = tool.id
  }
  const current = toolManager.current === tool
  const style = {
    // using absolute path as workaround of https://bugs.chromium.org/p/chromium/issues/detail?id=618165
    '--icon': `url(http://${location.host}${tool.icon})`
  }
  return <div className={classNames(styles.item, {[styles.itemCurrent]: current})} style={style} onClick={onClick} />
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
