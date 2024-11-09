import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm";
import { SiteCharacteristic } from "./SiteCharacteristic";

export enum EntryStatus {
  OK = 'ok',
  ERROR = 'error'
}

@Entity()
export class SiteLog {
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => SiteCharacteristic, sc => sc.log)
  public characteristic: SiteCharacteristic

  @Column('datetime', { precision: 0 })
  public logUTCTime: Date

  @Column('enum', { 
    enum: EntryStatus, 
    default: EntryStatus.OK
  })
  public status: EntryStatus

  @Column('varchar', { length: 255, nullable: true })
  public error: string

  @Column('datetime', { precision: 0, nullable: true })
  public meterUTCTimestamp!: Date

  @Column('bigint', {default: 0})
  public value: number

  @CreateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)'
  })
  createdUTCTime: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  updatedUTCTime: Date

  @DeleteDateColumn({
    type: 'datetime',
    precision: 0
  })
  deletedUTCTime!: Date
}