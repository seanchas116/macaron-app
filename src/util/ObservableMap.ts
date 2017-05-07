import {Atom} from 'mobx'

export class ObservableMap<K, T> implements Iterable<[K, T]> {
  private atom = new Atom('ObservableMap')
  private map: Map<K, T>

  constructor (pairs?: Iterable<[K, T]>) {
    this.map = new Map(pairs || [])
  }

  set (key: K, value: T) {
    this.atom.reportChanged()
    this.map.set(key, value)
    return this
  }

  clear () {
    this.atom.reportChanged()
    this.map.clear()
  }

  delete (key: K) {
    this.atom.reportChanged()
    return this.map.delete(key)
  }

  replace (pairs: Iterable<[K, T]>) {
    this.atom.reportChanged()
    this.map = new Map(pairs)
  }

  get (key: K) {
    this.atom.reportObserved()
    return this.map.get(key)
  }

  has (key: K) {
    this.atom.reportObserved()
    return this.map.has(key)
  }

  get size () {
    this.atom.reportObserved()
    return this.map.size
  }

  [Symbol.iterator] () {
    this.atom.reportObserved()
    return this.map[Symbol.iterator]()
  }

  keys () {
    this.atom.reportObserved()
    return this.map.keys()
  }

  values () {
    this.atom.reportObserved()
    return this.map.values()
  }

  peek () {
    this.atom.reportObserved()
    return new Map(this.map)
  }
}
