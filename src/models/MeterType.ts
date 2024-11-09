import { 
  Column, 
  Entity, 
  ManyToOne, 
  OneToMany, 
  PrimaryColumn, 
  CreateDateColumn,
  UpdateDateColumn } from "typeorm";
import { Medium } from "./Medium";
import { Meter } from "./Meter";
import { MeterTypeUnit } from "./MeterTypeUnit";

@Entity()
export class MeterType {
  @PrimaryColumn('varchar')
  public id: string

  @Column()
  public manufacturer: string

  @Column()
  public model: string

  @OneToMany(() => Meter, (m) => m.type)
  public meters: Meter[]

  @OneToMany(() => MeterTypeUnit, mtu => mtu.meterType)
  public units: MeterTypeUnit[]

  @CreateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)'
  })
  createdTime: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  updatedTime: Date
}