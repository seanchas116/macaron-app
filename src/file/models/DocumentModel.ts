import {Entity, PrimaryColumn, Column} from 'typeorm'

@Entity('document')
export class DocumentModel {
  @PrimaryColumn('int', { generated: true }) id: number
  @Column('json') selectedItemIds: string[]
  @Column('int') scrollX: number
  @Column('int') scrollY: number
}
