import * as React from 'react'
import * as ReactDOM from 'react-dom'
const decamelize = require('decamelize')

interface CSSVariablesProps {
  [key: string]: string|number|React.ReactChild
}

export
class CSSVariables extends React.Component<CSSVariablesProps, {}> {
  private oldProps: CSSVariablesProps = {}
  private element: HTMLElement|undefined

  componentDidMount () {
    this.element = ReactDOM.findDOMNode(this) as HTMLElement
    this.setProperties(this.props)
  }
  componentWillReceiveProps (props: CSSVariablesProps) {
    this.setProperties(props)
  }
  render () {
    return React.Children.only(this.props.children)
  }

  private setProperties (props: CSSVariablesProps) {
    if (this.element) {
      for (const key in props) {
        if (['key', 'ref', 'children'].indexOf(key) < 0) {
          if (this.oldProps[key] !== props[key]) {
            this.element.style.setProperty(`--${decamelize(key, '-')}`, `${props[key]}`)
          }
        }
      }
      this.oldProps = props
    }
  }
}
