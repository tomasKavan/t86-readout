import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm'
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

  @OneToMany(() => ConsumptionPlace, (cp) => cp.medium)
  public consumptionPlaces: ConsumptionPlace[]

  @OneToMany(() => MeterType, (mt) => mt.medium)
  public meterTypes: MeterType[]
}
