import { observable, observe, IObjectChange, IObservableArray } from 'mobx'
import 'reflect-metadata'
import * as uuid from 'uuid'
import { Vec2, Rect } from 'paintvec'
import { Document } from '../Document'
import { Grouping } from './Grouping'

export interface ItemData {
  id: string
  type: string
  name: string
  collapsed: boolean
  childIds: string[]
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

export interface GroupLikeItem extends Item {
  grouping: Grouping
}

export
abstract class Item {
  @undoable @observable name = 'Item'
  @undoable @observable fill = '#888888'
  @undoable @observable fillEnabled = true
  @undoable @observable stroke = '#000000'
  @undoable @observable strokeEnabled = true
  @undoable @observable strokeWidth = 1
  @observable parent: GroupLikeItem|undefined

  grouping?: Grouping = undefined

  readonly id: string
  isDirty = false

  constructor (public readonly document: Document, id?: string) {
    this.id = id || uuid()
    document.itemForId.set(this.id, this)

    observe(this, change => this.onPropertyChange(change))
  }

  dispose () {
    if (this.parent) {
      this.parent.grouping.removeChild(this)
    }
    this.document.selectedItems.delete(this)
    if (this.document.focusedItem === this) {
      this.document.focusedItem = undefined
    }
    this.document.itemForId.delete(this.id)
  }

  loadData (data: ItemData) {
    this.name = data.name
    this.fill = data.fill
    this.fillEnabled = data.fillEnabled
    this.stroke = data.stroke
    this.strokeWidth = data.strokeWidth
    this.strokeEnabled = data.strokeEnabled
    this.collapsed = data.collapsed
  }

  toData (): ItemData {
    const {id, name, fill, fillEnabled, stroke, strokeWidth, strokeEnabled, collapsed} = this
    const childIds = this.children.map(c => c.id)
    return {
      type: 'none',
      id,
      name,
      fill,
      fillEnabled,
      stroke,
      strokeWidth,
      strokeEnabled,
      collapsed,
      childIds
    }
  }

  private onPropertyChange (change: IObjectChange) {
    const undoable = Reflect.getMetadata(metadataUndoable, this, change.name)
    if (undoable) {
      this.isDirty = true
    }
  }

  get siblings (): ReadonlyArray<Item> {
    if (this.parent) {
      return this.parent.grouping.children
    } else {
      return []
    }
  }
}
