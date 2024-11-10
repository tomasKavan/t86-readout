import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { SiteCharacteristic } from "./SiteCharacteristic"
import { MeterTypeUnit } from "./MeterTypeUnit"
import { SiteMeterInstallation } from "./SiteMeterInstallation"

@Entity()
export class SiteMeterInstallationMap {
  @ManyToOne(() => SiteCharacteristic, sc => sc.map, {
    onDelete: 'CASCADE',
    nullable: false
  })
  public siteCharacteristic: SiteCharacteristic

  @ManyToOne(() => MeterTypeUnit, mtu => mtu.installationMap, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public meterTypeUnit: MeterTypeUnit

  @ManyToOne(() => SiteMeterInstallation, smi => smi.map, {
    onDelete: 'CASCADE',
    nullable: false
  })
  public installation: SiteMeterInstallation

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