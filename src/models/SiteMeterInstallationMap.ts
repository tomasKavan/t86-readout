import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { SiteCharacteristic } from "./SiteCharacteristic"
import { MeterTypeUnit } from "./MeterTypeUnit"

@Entity()
export class SiteMeterInstallationMap {
  @ManyToOne(() => SiteCharacteristic, sc => sc.map)
  public siteCharacteristic: SiteCharacteristic

  @ManyToOne(() => MeterTypeUnit, mtu => mtu.installationMap)
  public meterTypeUnit: MeterTypeUnit

  @CreateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)'
  })
  createdUTCTime: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  updatedUTCTime: Date
}