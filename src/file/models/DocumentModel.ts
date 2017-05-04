import {Entity, PrimaryColumn, Column} from 'typeorm'

interface DocumentModelData {
  selectedItemIds: string[]
  scrollX: number
  scrollY: number
  version: number
}

@Entity('document')
export class DocumentModel {
  @PrimaryColumn('int', { generated: true }) id: number
  @Column('json') data: DocumentModelData
}
