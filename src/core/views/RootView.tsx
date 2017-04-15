import * as React from 'react'
const styles = require('./RootView.css')

export
class RootView extends React.Component<{}, {}> {
  render() {
    return (
      <div className={styles.RootView}>
        Root View
      </div>
    )
  }
}
