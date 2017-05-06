import {Atom} from 'mobx'

export class ObservableSet<T> implements Iterable<T> {
  private atom = new Atom('ObservableSet')
  private set: Set<T>

  constructor (values?: Iterable<T>) {
    this.set = new Set(values || [])
  }

  add (value: T) {
    this.atom.reportChanged()
    this.set.add(value)
    return this
  }

  clear () {
    this.atom.reportChanged()
    this.set.clear()
  }

  delete (value: T) {
    this.atom.reportChanged()
    return this.set.delete(value)
  }

  replace (values: Iterable<T>) {
    this.atom.reportChanged()
    this.set = new Set(values)
  }

  has (value: T) {
    this.atom.reportObserved()
    return this.set.has(value)
  }

  get size () {
    this.atom.reportObserved()
    return this.set.size
  }

  [Symbol.iterator] () {
    this.atom.reportObserved()
    return this.set[Symbol.iterator]()
  }

  peek () {
    this.atom.reportObserved()
    return new Set(this.set)
  }
}
