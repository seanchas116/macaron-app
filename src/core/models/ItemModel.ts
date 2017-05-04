import {Entity, TableInheritance, DiscriminatorColumn, PrimaryColumn, Column} from 'typeorm'

@Entity('item')
@TableInheritance('single-table')
@DiscriminatorColumn({name: 'type', type: 'string'})
export abstract class ItemModel {
  @PrimaryColumn('string') id: string
  @Column() name: string
  @Column() fill: string
  @Column() stroke: string
  @Column() strokeWidth: number
  @Column() parentId: string
}
