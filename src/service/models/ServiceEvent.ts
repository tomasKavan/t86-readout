import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  ManyToOne, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Field, GraphQLISODateTime, ID, Int, ObjectType, registerEnumType } from "type-graphql"

import { MeasPoint } from "./MeasPoint"
import { Correction } from "./Correction"

export enum Type {
  METER_REPLACEMENT = 'metrep'
}
registerEnumType(Type, {
  name: 'ServiceEventType',
  description: 'Type of occured service event. At the moment only meter replacement event is supported.'
})

@Entity()
@ObjectType()
export class ServiceEvent {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  public id!: number

  @Column('enum', { enum: Type })
  @Field(() => Type)
  public type!: Type

  @Column('datetime', { precision: 0 })
  @Field(() => GraphQLISODateTime)
  public occuredUTCTime!: Date

  @ManyToOne(() => MeasPoint, mp => mp.serviceEvents, { 
    onUpdate: 'CASCADE', 
    onDelete: 'CASCADE' 
  })
  @Field(() => MeasPoint)
  public measPoint!: MeasPoint

  @OneToMany(() => Correction, c => c.serviceEvent)
  @Field(() => [Correction])
  public corrections!: Correction[]

  @Column('int', { nullable: true })
  @Field(() => Int, { nullable: true })
  public oldMbusAddr?: number

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public oldMbusSerial?: string

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public oldMeterManufacturer?: string

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public oldMeterType?: string

  @Column('text', { nullable: true })
  @Field(() => String, { nullable: true })
  public comments?: String

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