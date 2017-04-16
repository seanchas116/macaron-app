import * as React from 'react'
import {observer} from 'mobx-react'
import * as classNames from 'classnames'
import {Tool} from '../Tool'
import {toolRegistry} from '../ToolRegistry'
const styles = require('./ToolSelect.css')

const ToolSelectItem = observer((props: {tool: Tool}) => {
  const {tool} = props
  const style = {
    WebkitMaskImage: `url("${tool.icon}")`
  }
  const onClick = () => {
    toolRegistry.current = tool
  }
  const current = toolRegistry.current === tool
  return <div className={classNames(styles.item, {[styles.current]: current})} style={style} onClick={onClick}>
  </div>
})

@observer
export
class ToolSelect extends React.Component<{}, {}> {
  render () {
    const {tools} = toolRegistry
    return <div className={styles.ToolSelect}>
      {tools.map(tool => <ToolSelectItem tool={tool} key={tool.id} />)}
    </div>
  }
}
