import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  Index, 
  ManyToOne, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Field, GraphQLISODateTime, ID, Int, ObjectType, registerEnumType } from "type-graphql"

import { MeasPoint } from "./MeasPoint"
import { MetricType, Func } from "./MetricEnums"
import { Readout } from "./Readout"
import { Correction } from "./Correction"

registerEnumType(MetricType, {
  name: 'MetricType',
  description: 'Recurent event observed/measured by metric. Like consumption or time elapsed.'
})

registerEnumType(Func, {
  name: 'MetricFunc',
  description: 'Type of function related to metric. Describes if observed values are instantenious, summary or something else.'
})

@Entity()
@ObjectType()
@Index(['measPoint', 'mbusValueRecordId'], { unique: true })
export class Metric {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id!: number

  @ManyToOne(() => MeasPoint, mp => mp.metrics, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    cascade: ['insert', 'update']
  })
  @Field(() => MeasPoint)
  public measPoint!: MeasPoint

  @Column('enum', { enum: MetricType })
  @Field(() => MetricType)
  public type!: MetricType

  @Column('enum', { enum: Func })
  @Field(() => Func)
  public func!: Func

  @Column('boolean', { default: false })
  @Field(() => Boolean)
  public hasPhysicalDisplay!: boolean

  @Column('boolean', { default: false })
  @Field(() => Boolean)
  public autoReadoutEnabled!: boolean

  @Column('int', { nullable: true })
  @Field(() => Int)
  public mbusValueRecordId?: number

  @Column('int', { nullable: true })
  @Field(() => Int)
  public mbusDecimalShift?: number

  @OneToMany(() => Readout, r => r.metric)
  @Field(() => [Readout])
  public readouts!: Readout[]

  @OneToMany(() => Correction, c => c.metric)
  @Field(() => [Correction])
  public corrections!: Correction[]
  
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