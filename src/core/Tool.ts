
export
abstract class Tool {
  abstract id: string
  abstract icon: string
  abstract renderOverlay (): JSX.Element
}
