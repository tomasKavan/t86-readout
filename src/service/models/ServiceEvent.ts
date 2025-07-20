import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { MeasPoint } from "./MeasPoint";
import { Readout } from "./Readout";

export enum Type {
  METER_REPLACEMENT = 'metrep'
}

@Entity()
export class ServiceEvent {
  @PrimaryColumn()
  public id: number

  @Column('enum', { enum: Type })
  public type: Type

  @Column('datetime', { precision: 0, nullable: true })
  public occuredUTCTime!: Date

  @ManyToOne(() => MeasPoint, mp => mp.serviceEvents)
  public measPoint: MeasPoint

  @OneToMany(() => Readout, r => r.relatedServiceEvent)
  public corrections: Readout[]

  @Column('text')
  public comments: String

  @Column('json')
  public oldValues: any

  @Column('json')
  public newValues: any

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