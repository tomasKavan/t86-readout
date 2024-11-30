import { Entity, ManyToOne, CreateDateColumn, UpdateDateColumn, TableInheritance, PrimaryGeneratedColumn } from "typeorm"
import { SiteCharacteristic } from "./SiteCharacteristic"
import { MeterTypeUnit } from "./MeterTypeUnit"
import { SiteMeterInstallation } from "./SiteMeterInstallation"

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'mapType' }})
export class InstallationMap {
  @PrimaryGeneratedColumn()
  public readonly id: number

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