import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Metric } from "./Metric";
import { ServiceEvent } from "./ServiceEvent";

export enum Subject {
  ELECTRICITY = 'ele',
  GAS_FUEL = 'gas',
  WATER = 'wat',
  HEAT = 'hth',
  ENVIRONMENT = 'env',
  CLEANING = 'cln'
}

enum SubjectSpec {
  COLD = 'cold',
  HOT = 'hot'
}

@Entity()
export class MeasPoint {
  @PrimaryColumn('varchar', { length: 16 })
  public id: string

  @Column('varchar')
  public name: string

  @Column('varchar', { length: 8 })
  public roomNo: string

  @Column('varchar')
  public instDetails: string

  @Column('varchar')
  public notes: string

  @Column('enum', { enum: Subject })
  public subject: Subject

  @Column('enum', { enum: SubjectSpec })
  public subjectSpec: SubjectSpec

  @Column('smallint')
  public mbusAddr: number

  @Column('bigint')
  public mbusSerial: number

  @OneToMany(() => Metric, m => m.measPoint)
  public metrics: Metric[] 

  @OneToMany(() => ServiceEvent, se => se.measPoint)
  public serviceEvents: ServiceEvent[]

}