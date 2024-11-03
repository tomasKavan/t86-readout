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

@Entity()
export class MeterType {
  @PrimaryColumn('varchar')
  public id: string

  @Column()
  public manufacturer: string

  @Column()
  public model: string

  @Column('int')
  public valueRecordId: number

  @Column('int')
  public rescaleOrder: number

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

  @ManyToOne(() => Medium, {
    eager: true, 
    onDelete: 'RESTRICT',
    nullable: false
  })
  public medium: Medium

  @OneToMany(() => Meter, (m) => m.type)
  public meters: Meter[]
}