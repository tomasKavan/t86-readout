import { 
  Column, 
  Entity, 
  Unique, 
  OneToMany, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn } from "typeorm";
import { MeterType } from "./MeterType";
import { MeterInstallation } from "./MeterInstallation";

@Entity()
@Unique(['type', 'serialNumber'])
export class Meter {
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => MeterType, (mt) => mt.meters, {
    eager: true, 
    onDelete: 'RESTRICT', 
    nullable: false
  })
  public type: MeterType

  @Column('varchar')
  public serialNumber: string

  @Column('int')
  public mbusSecondary: number

  @Column('text')
  public notes: string

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

  @OneToMany(() => MeterInstallation, mi => mi.meter)
  public installations: MeterInstallation[]
}