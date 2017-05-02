export
function isTextInput (elem: Element) {
  if (elem instanceof HTMLElement) {
    if (elem.isContentEditable) {
      return true
    }
  }
  if (elem instanceof HTMLTextAreaElement) {
    return true
  }
  if (elem instanceof HTMLInputElement) {
    const inputTypes = ['text', 'password', 'number', 'email', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
    return inputTypes.includes(elem.type)
  }
  return false
}
