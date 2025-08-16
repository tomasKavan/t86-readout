import { 
  Column, 
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn, 
  Index
} from 'typeorm'
import { Field, GraphQLISODateTime, ID, Int, ObjectType } from 'type-graphql'
import Big from 'big.js'

import { ServiceEvent } from './ServiceEvent'
import { Metric } from './Metric'
import { BigScalar } from '../scalars/BigScalar'

@Entity()
@Index('idx_correction_event_metric', ['serviceEvent', 'metric'])
@Index('idx_correction_event_metric_deleted', ['serviceEvent', 'metric', 'deletedUTCTime'])
@ObjectType()
export class Correction {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id!: number

  @ManyToOne(() => ServiceEvent, s => s.corrections, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false
  })
  @Field(() => ServiceEvent)
  public serviceEvent!: ServiceEvent

  @ManyToOne(() => Metric, m => m.corrections, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false
  })
  @Field(() => Metric)
  public metric!: Metric

  @Column({ 
    type: 'decimal',
    precision: 16,
    scale: 3,
    default: 0,
    transformer: {
      to: (v: Big) => v instanceof Big ? v.toString() : v,
      from: (v: string) => v === null ? null : new Big(v) 
    } 
  })
  @Field(() => BigScalar)
  public value!: Big

  @Column({ 
    type: 'decimal',
    precision: 16,
    scale: 3,
    nullable: true,
    transformer: {
      to: (v: Big) => v instanceof Big ? v.toString() : v,
      from: (v: string) => v === null ? null : new Big(v)
    } 
  })
  @Field(() => BigScalar, { nullable: true })
  public oldMeterEndValue?: Big | null

  @Column({ 
    type: 'decimal',
    precision: 16,
    scale: 3,
    nullable: true,
    transformer: {
      to: (v: Big) => v instanceof Big ? v.toString() : v,
      from: (v: string) => v === null ? null : new Big(v)
    } 
  })
  @Field(() => BigScalar, { nullable: true })
  public newMeterStartValue?: Big | null

  @Column('boolean', { nullable: true })
  @Field(() => Boolean, { nullable: true })
  public oldMeterHasPhysicalDisplay?: boolean | null

  @Column('int', { nullable: true })
  @Field(() => Int, { nullable: true })
  public oldMeterMbusValueRecordId?: number | null

  @Column('int', { nullable: true })
  @Field(() => Int, { nullable: true })
  public oldMeterMbusDecimalShift?: number | null

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
  public deletedUTCTime?: Date | null
}
