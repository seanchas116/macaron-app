import { observable, observe, IObjectChange } from 'mobx'
import 'reflect-metadata'
import * as uuid from 'uuid'
import { Vec2, Rect } from 'paintvec'
import { Document } from '../Document'
import { GroupItem } from './GroupItem'

export interface ItemData {
  id: string
  type: string
  name: string
  fill: string
  fillEnabled: boolean
  stroke: string
  strokeWidth: number
  strokeEnabled: boolean
}

const metadataUndoable = Symbol('Item.undoable')

export function undoable (target: Item, key: string) {
  Reflect.defineMetadata(metadataUndoable, true, target, key)
}

export function undoableArray<T> (target: Item, array: T[]) {
  const observableArray = observable(array)
  observableArray.observe(() => target.isDirty = true)
  return observableArray
}

export
abstract class Item {
  @undoable @observable name = 'Item'
  @undoable @observable fill = '#888888'
  @undoable @observable fillEnabled = true
  @undoable @observable stroke = '#000000'
  @undoable @observable strokeEnabled = true
  @undoable @observable strokeWidth = 1
  @observable parent: GroupItem|undefined
  readonly id: string
  isDirty = false

  abstract position: Vec2
  abstract size: Vec2

  get rect () {
    return Rect.fromSize(this.position, this.size)
  }
  set rect (rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  constructor (public readonly document: Document, id?: string) {
    this.id = id || uuid()
    document.itemForId.set(this.id, this)

    observe(this, change => this.onPropertyChange(change))
  }

  dispose () {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    this.document.selectedItems.delete(this)
    if (this.document.focusedItem === this) {
      this.document.focusedItem = undefined
    }
    this.document.itemForId.delete(this.id)
  }

  abstract clone (opts?: {shallow?: boolean}): Item

  loadData (data: ItemData) {
    this.name = data.name
    this.fill = data.fill
    this.fillEnabled = data.fillEnabled
    this.stroke = data.stroke
    this.strokeWidth = data.strokeWidth
    this.strokeEnabled = data.strokeEnabled
  }

  toData (): ItemData {
    const {id, name, fill, fillEnabled, stroke, strokeWidth, strokeEnabled} = this
    return {
      type: 'none',
      id,
      name,
      fill,
      fillEnabled,
      stroke,
      strokeWidth,
      strokeEnabled
    }
  }

  forEachDescendant (action: (item: Item) => void) {
    action(this)
    if (this instanceof GroupItem) {
      for (const child of this.children) {
        child.forEachDescendant(action)
      }
    }
  }

  get allDescendants (): ReadonlyArray<Item> {
    const descendants: Item[] = []
    if (this instanceof GroupItem) {
      for (const child of this.children) {
        descendants.push(...child.allDescendants)
      }
    }
    descendants.push(this)
    return descendants
  }

  get siblings (): ReadonlyArray<Item> {
    if (this.parent) {
      return this.parent.children
    } else {
      return []
    }
  }

  private onPropertyChange (change: IObjectChange) {
    const undoable = Reflect.getMetadata(metadataUndoable, this, change.name)
    if (undoable) {
      this.isDirty = true
    }
  }
}
