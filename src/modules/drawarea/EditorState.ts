import { observable } from 'mobx'

export type InsertMode = 'none' | 'rect' | 'oval' | 'text' | 'path'

export class EditorState {
  @observable insertMode: InsertMode = 'none'
}

export const editorState = new EditorState()
