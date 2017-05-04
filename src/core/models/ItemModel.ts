import {Entity, PrimaryColumn, Column} from 'typeorm'

@Entity('item')
export abstract class ItemModel {
  @PrimaryColumn('string') id: string
  @Column('json') data: any
}
