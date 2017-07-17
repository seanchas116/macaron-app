import * as React from 'react'
import { observer } from 'mobx-react'
import * as classNames from 'classnames'
import { editorState, InsertMode } from '../drawarea'
import { CSSVariables } from '../../util/components/CSSVariables'
const styles = require('./InsertPalette.css')

const icons = {
  'rect': require('./icons/rect.svg'),
  'oval': require('./icons/oval.svg'),
  'text': require('./icons/text.svg'),
  'path': require('./icons/path.svg')
}

const InsertPaletteItem = observer((props: {mode: InsertMode}) => {
  const selected = editorState.insertMode === props.mode
  const onClick = () => {
    editorState.insertMode = props.mode
  }
  // using absolute path as workaround of https://bugs.chromium.org/p/chromium/issues/detail?id=618165
  return <CSSVariables icon={`url(http://${location.host}${icons[props.mode]})`}>
    <div className={classNames(styles.item, {[styles.itemSelected]: selected})} onClick={onClick} />
  </CSSVariables>
})

@observer
export
class InsertPalette extends React.Component<{}, {}> {
  insertModes: InsertMode[] = ['rect', 'oval', 'text', 'path']

  render () {
    return <div className={styles.InsertPalette}>
      {this.insertModes.map(mode => <InsertPaletteItem mode={mode} key={mode} />)}
    </div>
  }
}
