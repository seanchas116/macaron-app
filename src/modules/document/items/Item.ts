import { observable } from 'mobx'
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

export function undoable (target: Item, key: string, descriptor?: PropertyDescriptor): any {
  if (descriptor) {
    const newDescriptor: PropertyDescriptor = {...descriptor}
    const oldSet = newDescriptor.set!
    newDescriptor.set = function (value: any) {
      (this as Item).isDirty = true
      oldSet.call(this, value)
    }
    Object.defineProperty(target, key, newDescriptor)
    return newDescriptor
  }
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
  }

  dispose () {
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

  get siblings (): Item[] {
    if (this.parent) {
      return this.parent.children
    } else {
      return []
    }
  }
}
