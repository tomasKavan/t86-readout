import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm"
import { SiteCharacteristic } from "./SiteCharacteristic"
import { SiteMeterInstallation } from "./SiteMeterInstallation"

export enum EntryStatus {
  OK = 'ok',
  ERROR = 'error'
}

@Entity()
export class SiteLog {
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => SiteCharacteristic, sc => sc.log, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public characteristic: SiteCharacteristic

  @ManyToOne(() => SiteMeterInstallation, smi => smi.log, {
    onDelete: 'SET NULL',
    nullable: true
  })
  public siteMeterInstallation: SiteMeterInstallation

  @Column('boolean', { default: true })
  public valid: boolean

  @Column('datetime', { precision: 0 })
  public logUTCTime: Date

  @Column('enum', { 
    enum: EntryStatus, 
    default: EntryStatus.OK
  })
  public status: EntryStatus

  @Column('varchar', { nullable: true })
  public error: string

  @Column('datetime', { precision: 0, nullable: true })
  public meterUTCTimestamp!: Date

  @Column('bigint', {default: 0})
  public value: number

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