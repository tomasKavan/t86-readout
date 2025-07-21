import { 
  Column, 
  CreateDateColumn, 
  DeleteDateColumn, 
  Entity, 
  OneToMany, 
  PrimaryColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Metric } from "./Metric"
import { ServiceEvent } from "./ServiceEvent"
import { Subject, SubjectSpec } from "./MetricEnums"


@Entity()
export class MeasPoint {
  @PrimaryColumn('varchar', { length: 16 })
  public id!: string

  @Column('varchar')
  public name!: string

  @Column('varchar', { length: 8 })
  public roomNo!: string

  @Column('varchar', { default: '' })
  public instDetails!: string

  @Column('varchar', { default: '' })
  public notes!: string

  @Column('enum', { enum: Subject })
  public subject!: Subject

  @Column('enum', { enum: SubjectSpec, nullable: true })
  public subjectSpec!: SubjectSpec

  @Column('smallint', { nullable: true })
  public mbusAddr!: number

  @Column('varchar', { nullable: true })
  public mbusSerial!: string

  @OneToMany(() => Metric, m => m.measPoint)
  public metrics!: Metric[] 

  @OneToMany(() => ServiceEvent, se => se.measPoint)
  public serviceEvents!: ServiceEvent[]

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