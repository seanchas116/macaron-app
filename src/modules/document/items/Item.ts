import { observable, observe, IObjectChange } from 'mobx'
import 'reflect-metadata'
import * as uuid from 'uuid'
import { Document } from '../Document'
import { Grouping, GroupingData } from './Grouping'
import { Shape, ShapeData } from './Shape'
import { Style, StyleData } from './Style'

export interface ItemData {
  id: string
  type: string
  name: string
  grouping?: GroupingData
  style?: StyleData
  shape?: ShapeData
}

const metadataUndoable = Symbol('Item.undoable')

export function undoable (target: Item|ItemComponent, key: string) {
  Reflect.defineMetadata(metadataUndoable, true, target, key)
}

export function undoableArray<T> (target: Item, array: T[]) {
  const observableArray = observable(array)
  observableArray.observe(() => target.isDirty = true)
  return observableArray
}

export abstract class ItemComponent {
  constructor (public item: Item) {
    observe(this, change => this.onPropertyChange(change))
  }

  private onPropertyChange (change: IObjectChange) {
    const undoable = Reflect.getMetadata(metadataUndoable, this, change.name)
    if (undoable) {
      this.item.isDirty = true
    }
  }
}

export interface GroupLikeItem extends Item {
  grouping: Grouping
}

export
abstract class Item {
  @observable parent: GroupLikeItem|undefined
  @undoable @observable name = 'Item'

  grouping?: Grouping = undefined
  style?: Style = undefined
  shape?: Shape = undefined

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
    if (this.grouping && data.grouping) {
      this.grouping.loadData(data.grouping)
    }
  }

  toData (): ItemData {
    const {id, name} = this
    return {
      id, name,
      type: 'none',
      grouping: this.grouping && this.grouping.toData(),
      style: this.style && this.style.toData(),
      shape: this.shape && this.shape.toData()
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
