import {Entity, PrimaryColumn, Column} from 'typeorm'
import {ItemData} from '../core/items/Item'

@Entity('item')
export class ItemModel {
  @PrimaryColumn('string') id: string
  @Column({type: 'string', nullable: true}) parentId: string|undefined
  @Column('json') data: ItemData
}
