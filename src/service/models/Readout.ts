import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  ManyToOne, 
  PrimaryColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Metric } from "./Metric"
import { ServiceEvent } from "./ServiceEvent"

export enum Type {
  READOUT = 'rout',
  CORRECTION = 'corr',
  ERROR = 'err'
}

export enum Source {
  MBUS = 'mbus',
  MANUAL = 'man'
}

enum ErrCode {
  E_MBUS_CONNECTION,
  E_MBUS_SLAVE_READ,
  E_MBUS_SERIAL_MISMATCH,
}

@Entity()
export class Readout {
  @PrimaryColumn()
  public id: number

  @ManyToOne(() => Metric, m => m.readouts)
  public metric: Metric

  @Column('enum', { enum: Type })
  public type: Type

  @Column('enum', { enum: Source })
  public source: Source

  @Column('bigint', { default: 0 })
  public value: number

  @Column('enum', { nullable: true })
  public errCode: ErrCode

  @Column('varchar', { nullable: true })
  public errDetail: string

  @ManyToOne(() => ServiceEvent, se => se.corrections, { nullable: true })
  public relatedServiceEvent?: ServiceEvent

  @Column('datetime', { precision: 0, nullable: true })
  public meterUTCTimestamp!: Date

  @CreateDateColumn({ 
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
  })
  public createdUTCTime: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  public updatedUTCTime: Date

  @DeleteDateColumn({
    type: 'datetime',
    precision: 0
  })
  public deletedUTCTime!: Date
}