import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  OneToMany, 
  PrimaryColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Field, GraphQLISODateTime, ID, Int, ObjectType, registerEnumType } from "type-graphql"

import { Metric } from "./Metric"
import { ServiceEvent } from "./ServiceEvent"
import { Subject, SubjectSpec } from "./MetricEnums"

registerEnumType(Subject, {
  name: 'MeasPointSubject',
  description: 'Subject of measurements observed by meter on measurement point'
})

registerEnumType(SubjectSpec, {
  name: 'MeasPointSubjectSpecifier',
  description: 'Close specificationon of MeasPoint Subject. Can be null'
})

@Entity()
@ObjectType()
export class MeasPoint {
  @PrimaryColumn('varchar', { length: 16 })
  @Field(() => ID)
  public id!: string

  @Column('varchar')
  @Field(() => String)
  public name!: string

  @Column('varchar', { length: 8 })
  @Field(() => String)
  public roomNo!: string

  @Column('varchar', { default: '' })
  @Field(() => String, { defaultValue: ''})
  public instDetails!: string

  @Column('varchar', { default: '' })
  @Field(() => String)
  public notes!: string

  @Column('enum', { enum: Subject })
  @Field(() => Subject)
  public subject!: Subject

  @Column('enum', { enum: SubjectSpec, nullable: true })
  @Field(() => SubjectSpec, { nullable: true })
  public subjectSpec?: SubjectSpec | null

  @Column('smallint', { nullable: true })
  @Field(() => Int, { nullable: true })
  public mbusAddr?: number | null

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public mbusSerial?: string | null

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public meterManufacturer?: string | null

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  public meterType?: string | null

  @Column('boolean', { default: false })
  @Field(() => Boolean)
  public autoReadoutEnabled!: boolean

  @OneToMany(() => Metric, m => m.measPoint, {
    cascade: ['insert', 'update']
  })
  @Field(() => [Metric])
  public metrics!: Metric[] 

  @OneToMany(() => ServiceEvent, se => se.measPoint)
  @Field(() => [ServiceEvent])
  public serviceEvents!: ServiceEvent[]

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
  public deletedUTCTime?: Date | null
}