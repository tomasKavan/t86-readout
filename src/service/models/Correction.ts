import { 
  Column, 
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn 
} from "typeorm"
import { Field, GraphQLISODateTime, ID, ObjectType } from "type-graphql"
import Big from "big.js"

import { ServiceEvent } from "./ServiceEvent"
import { Metric } from "./Metric"
import { BigScalar } from "../scalars/BigScalar"

@Entity()
@ObjectType()
export class Correction {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id!: number

  @ManyToOne(() => ServiceEvent, s => s.corrections, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  })
  @Field(() => ServiceEvent)
  public serviceEvent!: ServiceEvent

  @ManyToOne(() => Metric, m => m.corrections, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @Field(() => Metric)
  public metric!: Metric

  @Column({ 
    type: 'decimal',
    precision: 16,
    scale: 3,
    default: 0,
    transformer: {
      to: (v: Big) => v.toString(),
      from: (v: string) => new Big(v)
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
      to: (v: Big) => v.toString(),
      from: (v: string) => new Big(v)
    } 
  })
  @Field(() => BigScalar, { nullable: true })
  public oldMeterEndValue?: Big

  @Column({ 
    type: 'decimal',
    precision: 16,
    scale: 3,
    nullable: true,
    transformer: {
      to: (v: Big) => v.toString(),
      from: (v: string) => new Big(v)
    } 
  })
  @Field(() => BigScalar, { nullable: true })
  public newMeterStartValue?: Big

  @CreateDateColumn({ 
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
  })
  @Field(() => GraphQLISODateTime)
  public createdUTCTime!: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  @Field(() => GraphQLISODateTime)
  public updatedUTCTime!: Date

  @DeleteDateColumn({
    type: 'datetime',
    precision: 0
  })
  @Field(() => GraphQLISODateTime, { nullable: true })
  public deletedUTCTime?: Date
}