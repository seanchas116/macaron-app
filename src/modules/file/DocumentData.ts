
export interface DocumentData {
  version: number
  selectedItemIds: string[]
  scrollX: number
  scrollY: number
  pages: {name: string, path: string}[]
}
