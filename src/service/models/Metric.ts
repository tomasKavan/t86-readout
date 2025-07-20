import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { MeasPoint, Subject } from "./MeasPoint";
import { Readout } from "./Readout";

export enum MetricType {
  CONSUMPTION = 'cons',
  TIME_ELAPSED = 'tel'
}

export enum Func {
  INST = 'inst',
  SUM = 'sum'
}

export enum Unit {
  LITER = 'l',
  WATT_HOUR = 'wh',
  SECOND = 's'
}

type UnitMatrix = {
  [S in Subject]?: {
    [M in MetricType]?: Unit
  }
}
const unitMatrix: UnitMatrix = {
  [Subject.ELECTRICITY]: {
    [MetricType.CONSUMPTION]: Unit.WATT_HOUR
  },
  [Subject.GAS_FUEL]: {
    [MetricType.CONSUMPTION]: Unit.LITER
  },
  [Subject.WATER]: {
    [MetricType.CONSUMPTION]: Unit.LITER
  },
  [Subject.HEAT]: {
    [MetricType.CONSUMPTION]: Unit.WATT_HOUR
  },
  [Subject.CLEANING]: {
    [MetricType.TIME_ELAPSED]: Unit.SECOND
  }
}

export function unitForMetric(metric: Metric): Unit | undefined {
  return unitMatrix[metric.measPoint.subject]?.[metric.type]
}

// TODO: Unique - measPoint + mbusValueRecordId

@Entity()
export class Metric {
  @PrimaryColumn()
  public id: number

  @ManyToMany(() => MeasPoint, mp => mp.metrics)
  public measPoint: MeasPoint

  @Column('enum', { enum: MetricType })
  public type: MetricType

  @Column('enum', { enum: Func })
  public func: MetricType

  @Column('boolean')
  public hasPhysicalDisplay: boolean

  @Column('boolean')
  public autoReadoutEnabled: boolean

  @Column('int', { nullable: true })
  public mbusValueRecordId: number

  @Column('int', { nullable: true })
  public mbusDecimalShift: number

  @OneToMany(() => Readout, r => r.metric)
  public readouts: Readout[]
  
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