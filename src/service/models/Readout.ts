import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  Index, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Field, GraphQLISODateTime, ID, ObjectType, registerEnumType } from "type-graphql"
import Big from 'big.js'

import { Metric } from "./Metric"
import { ServiceEvent } from "./ServiceEvent"
import { ErrCode } from "../readout/mbus/MbusReadout"
import { BigScalar } from "../scalars/BigScalar"

export enum Type {
  READOUT = 'rout',
  ERROR = 'err'
}
registerEnumType(Type, {
  name: 'ReadoutType',
  description: 'Readout entry type. Shows if it\'s a classic row with values or errored row.'
})

export enum Source {
  MBUS = 'mbus',
  MANUAL = 'man'
}
registerEnumType(Source, {
  name: 'ReadoutSource',
  description: 'Source of Readout entry. Could be an automatic readout from mbus or manual entry from user.'
})

registerEnumType(ErrCode, {
  name: 'MBusReadoutErrCode',
  description: 'Error codes of automatic readout from M-Bus'
})

@Entity()
@Index('idx_readout_metric_ts_desc', ['metric', 'deletedUTCTime', 'meterUTCTimestamp'])
@Index('idx_readout_metric_ts_desc_value', ['metric', 'meterUTCTimestamp', 'value'])
@ObjectType()
export class Readout {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id!: number

  @ManyToOne(() => Metric, m => m.readouts, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @Field(() => Metric)
  public metric!: Metric

  @Column('enum', { enum: Type })
  @Field(() => Type)
  public type!: Type

  @Column('enum', { enum: Source })
  @Field(() => Source)
  public source!: Source

  @Column({ 
    type: 'decimal',
    precision: 16,
    scale: 3,
    default: 0,
    transformer: {
      to: (v: Big) => v.toString(),
      from: (v: string) => v === null ? null : new Big(v)
    } 
  })
  @Field(() => BigScalar)
  public value!: Big

  @Column('enum', { enum: ErrCode, nullable: true })
  @Field(() => ErrCode, { nullable: true })
  public errCode?: ErrCode

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public errDetail?: string

  @Column('datetime', { precision: 0, nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  public meterUTCTimestamp?: Date

  @CreateDateColumn({ 
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
  })
  @Field(() => GraphQLISODateTime)
  public createdUTCTime!: Date

  @DeleteDateColumn({
    type: 'datetime',
    precision: 0
  })
  public deletedUTCTime?: Date
}