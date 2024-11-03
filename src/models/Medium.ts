import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn } from 'typeorm'
import { ConsumptionPlace } from './ConsumptionPlace'
import { MeterType } from './MeterType'

@Entity()
export class Medium {
  @PrimaryColumn()
  public id: string

  @Column()
  public name: string

  @Column()
  public unitAbbr: string

  @Column()
  public unit: string

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

  @OneToMany(() => ConsumptionPlace, (cp) => cp.medium)
  public consumptionPlaces: ConsumptionPlace[]

  @OneToMany(() => MeterType, (mt) => mt.medium)
  public meterTypes: MeterType[]
}
