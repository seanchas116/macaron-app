
export abstract class Action {
  abstract id: string
  abstract title: string
  abstract enabled: boolean
  abstract run (): void
}

