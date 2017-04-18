import * as React from 'react'
import {observer} from 'mobx-react'
import * as classNames from 'classnames'
import {Tool} from '../Tool'
import {toolManager} from '../ToolManager'
const styles = require('./ToolSelect.css')

const ToolSelectItem = observer((props: {tool: Tool}) => {
  const {tool} = props
  const style = {
    WebkitMaskImage: `url("${tool.icon}")`
  }
  const onClick = () => {
    toolManager.current = tool
  }
  const current = toolManager.current === tool
  return <div className={classNames(styles.item, {[styles.current]: current})} style={style} onClick={onClick}>
  </div>
})

@observer
export
class ToolSelect extends React.Component<{}, {}> {
  render () {
    const {tools} = toolManager
    return <div className={styles.ToolSelect}>
      {tools.map(tool => <ToolSelectItem tool={tool} key={tool.id} />)}
    </div>
  }
}
