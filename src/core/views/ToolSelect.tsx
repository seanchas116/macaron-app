import * as React from 'react'
import {observer} from 'mobx-react'
import {Tool} from '../Tool'
import {toolRegistry} from '../ToolRegistry'
const styles = require('./ToolSelect.css')

function ToolSelectItem (props: {tool: Tool}) {
  const {tool} = props
  const style = {
    WebkitMaskImage: `url("${tool.icon}")`
  }
  return <div className={styles.item} style={style}>
  </div>
}

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
