import { Entity, PrimaryColumn, Column, ManyToOne, RelationId, OneToMany } from 'typeorm'

import { Medium } from './Medium'
import { ConsumptionQhourly } from './ConsumptionQhourly'
import { ConsumptionHourly } from './ConsumptionHourly'
import { ConsumptionDaily } from './ConsumptionDaily'
import { ConsumptionMonthly } from './ConsumptionMonthly'
import { MeterInstallation } from './MeterInstallation'

@Entity()
export class ConsumptionPlace {
  @PrimaryColumn("int")
  public mbusPrimary: number

  @Column()
  public name: string

  @Column()
  public installationRoomNumber: string

  @Column("text")
  public installationDetails: string

  @ManyToOne(() => Medium, (medium) => medium.consumptionPlaces, {
    eager: true, 
    onDelete: "RESTRICT",
    nullable: false
  })
  public medium: Medium

  @OneToMany(() => MeterInstallation, mi => mi.consumptionPlace)
  public installedMeters: MeterInstallation[]

  @OneToMany(() => ConsumptionQhourly, (cq) => cq.consumptionPlace)
  public consumptionQhourly: ConsumptionQhourly[] 

  @OneToMany(() => ConsumptionHourly, (cq) => cq.consumptionPlace)
  public consumptionHourly: ConsumptionHourly[] 

  @OneToMany(() => ConsumptionDaily, (cq) => cq.consumptionPlace)
  public consumptionDaily: ConsumptionDaily[] 

  @OneToMany(() => ConsumptionMonthly, (cq) => cq.consumptionPlace)
  public consumptionMonthly: ConsumptionMonthly[] 
}