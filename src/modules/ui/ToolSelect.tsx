import * as React from 'react'
import {observer} from 'mobx-react'
import * as classNames from 'classnames'
import {Tool, toolManager} from '../drawarea'
import {CSSVariables} from '../../util/components/CSSVariables'
const styles = require('./ToolSelect.css')

const ToolSelectItem = observer((props: {tool: Tool}) => {
  const {tool} = props
  const onClick = () => {
    toolManager.current = tool
  }
  const current = toolManager.current === tool
  // using absolute path as workaround of https://bugs.chromium.org/p/chromium/issues/detail?id=618165
  return <CSSVariables icon={`url(http://${location.host}${tool.icon})`}>
    <div className={classNames(styles.item, {[styles.itemCurrent]: current})} onClick={onClick} />
  </CSSVariables>
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
