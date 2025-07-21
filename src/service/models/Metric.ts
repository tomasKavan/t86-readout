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
import { MeasPoint } from "./MeasPoint"
import { MetricType, Func } from "./MetricEnums"
import { Readout } from "./Readout"

// TODO: Unique - measPoint + mbusValueRecordId

@Entity()
export class Metric {
  @PrimaryGeneratedColumn()
  public id!: number

  @ManyToOne(() => MeasPoint, mp => mp.metrics, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  })
  public measPoint!: MeasPoint

  @Column('enum', { enum: MetricType })
  public type!: MetricType

  @Column('enum', { enum: Func })
  public func!: MetricType

  @Column('boolean', { default: false })
  public hasPhysicalDisplay!: boolean

  @Column('boolean', { default: false })
  public autoReadoutEnabled!: boolean

  @Column('int', { nullable: true })
  public mbusValueRecordId!: number

  @Column('int', { nullable: true })
  public mbusDecimalShift!: number

  @OneToMany(() => Readout, r => r.metric)
  public readouts!: Readout[]
  
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