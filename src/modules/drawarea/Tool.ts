import { Vec2 } from 'paintvec'

export
abstract class Tool {
  abstract id: string
  abstract icon: string
  abstract renderOverlay (size: Vec2): JSX.Element
  abstract onKeyDown (event: React.KeyboardEvent<HTMLElement>): void
}
