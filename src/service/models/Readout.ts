import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Metric } from "./Metric"
import { ServiceEvent } from "./ServiceEvent"
import { ErrCode } from "../MbusReadout"

export enum Type {
  READOUT = 'rout',
  CORRECTION = 'corr',
  ERROR = 'err'
}

export enum Source {
  MBUS = 'mbus',
  MANUAL = 'man'
}

@Entity()
export class Readout {
  @PrimaryGeneratedColumn()
  public id!: number

  @ManyToOne(() => Metric, m => m.readouts)
  public metric!: Metric

  @Column('enum', { enum: Type })
  public type!: Type

  @Column('enum', { enum: Source })
  public source!: Source

  @Column('bigint', { default: 0 })
  public value!: number

  @Column('enum', { enum: ErrCode, nullable: true })
  public errCode!: ErrCode

  @Column('varchar', { nullable: true })
  public errDetail!: string

  @ManyToOne(() => ServiceEvent, se => se.corrections, { 
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  })
  public relatedServiceEvent?: ServiceEvent

  @Column('datetime', { precision: 0, nullable: true })
  public meterUTCTimestamp!: Date

  @CreateDateColumn({ 
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
  })
  public createdUTCTime!: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  public updatedUTCTime!: Date

  @DeleteDateColumn({
    type: 'datetime',
    precision: 0
  })
  public deletedUTCTime!: Date
}