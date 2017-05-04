import {Entity, PrimaryColumn, Column} from 'typeorm'
import {ItemData} from '../items/Item'

@Entity('item')
export abstract class ItemModel {
  @PrimaryColumn('string') id: string
  @Column('json') data: ItemData
}
