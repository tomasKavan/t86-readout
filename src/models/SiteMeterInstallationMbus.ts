import { ChildEntity, Column, ManyToOne, OneToMany } from "typeorm"
import { SiteMeterInstallation } from "./SiteMeterInstallation"
import { ReadMethodMBus } from "./ReadMethodMbus"
import { InstallationMapMbus } from "./InstallationMapMbus"

@ChildEntity()
export class SiteMeterInstallationMBus extends SiteMeterInstallation {
  @ManyToOne(() => ReadMethodMBus, m => m.installations, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public readMethod: ReadMethodMBus

  @Column('int')
  public mbusPrimary: number

  @Column('int', { default: 1 })
  public baseReadoutFrequencyDivider: number

  @OneToMany(() => InstallationMapMbus, smim => smim.installation)
  public map: InstallationMapMbus[]
}