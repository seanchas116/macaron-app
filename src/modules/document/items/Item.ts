import { observable, observe, IObjectChange, IObservableArray } from 'mobx'
import 'reflect-metadata'
import * as uuid from 'uuid'
import { Vec2, Rect } from 'paintvec'
import { Document } from '../Document'

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

export
abstract class Item {
  @undoable @observable name = 'Item'
  @undoable @observable fill = '#888888'
  @undoable @observable fillEnabled = true
  @undoable @observable stroke = '#000000'
  @undoable @observable strokeEnabled = true
  @undoable @observable strokeWidth = 1
  @observable collapsed = false
  @observable parent: Item|undefined

  readonly id: string
  isDirty = false

  abstract position: Vec2
  abstract size: Vec2

  private readonly _children: IObservableArray<Item> = undoableArray<Item>(this, [])

  get globalPosition () {
    return this.position.add(this.origin)
  }
  set globalPosition (pos: Vec2) {
    this.position = pos.sub(this.origin)
  }

  get rect () {
    return Rect.fromSize(this.position, this.size)
  }
  set rect (rect: Rect) {
    this.position = rect.topLeft
    this.size = rect.size
  }

  get globalRect () {
    return Rect.fromSize(this.globalPosition, this.size)
  }
  set globalRect (rect: Rect) {
    this.globalPosition = rect.topLeft
    this.size = rect.size
  }

  get children (): ReadonlyArray<Item> {
    return this._children.peek()
  }

  get canHaveChildren () {
    return false
  }

  get originOffset () {
    return new Vec2(0)
  }

  get origin (): Vec2 {
    if (this.parent) {
      return this.parent.origin.add(this.parent.originOffset)
    } else {
      return new Vec2(0)
    }
  }

  get focusable () {
    return false
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

  loadChildren (childIds: string[]) {
    this.clearChildren()
    for (const childId of childIds) {
      const item = this.document.itemForId.get(childId)
      if (!item) {
        throw new Error(`Child ${childId} is not found`)
      }
      this.appendChild(item)
    }
  }

  childAt (i: number) {
    if (0 <= i && i < this.children.length) {
      return this._children[i]
    }
  }

  removeChild (...items: Item[]) {
    for (const item of items) {
      const index = this.children.indexOf(item)
      if (index >= 0) {
        this._children.splice(index, 1)
        item.parent = undefined
      }
    }
  }

  clearChildren () {
    for (const child of this._children) {
      child.parent = undefined
    }
    this._children.clear()
  }

  insertBefore (item: Item, reference?: Item) {
    if (!this.canHaveChildren) {
      throw new Error('this item cannot have children')
    }

    if (reference && !this.children.includes(reference)) {
      throw new Error('reference item is not a child of the group')
    }

    const oldOrigin = item.origin

    const oldParent = item.parent
    if (oldParent) {
      oldParent.removeChild(item)
    }

    const index = reference ? this.children.indexOf(reference) : this.children.length
    this._children.splice(index, 0, item)
    item.parent = this

    const newOrigin = item.origin
    item.position = item.position.add(oldOrigin.sub(newOrigin))
  }

  appendChild (...items: Item[]) {
    for (const item of items) {
      this.insertBefore(item, undefined)
    }
  }

  allDescendants (): ReadonlyArray<Item> {
    const descendants: Item[] = []
    for (const child of this.children) {
      descendants.push(...child.allDescendants())
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

  includes (item: Item) {
    let ancestor = item.parent
    while (ancestor) {
      if (ancestor === this) {
        return true
      }
      ancestor = ancestor.parent
    }
    return false
  }

  private onPropertyChange (change: IObjectChange) {
    const undoable = Reflect.getMetadata(metadataUndoable, this, change.name)
    if (undoable) {
      this.isDirty = true
    }
  }
}
