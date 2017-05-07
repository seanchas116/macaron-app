
export abstract class Command {
  abstract title: string
  abstract redo (): void
  abstract undo (): void
}
