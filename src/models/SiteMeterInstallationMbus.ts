import { ChildEntity, Column, ManyToOne } from "typeorm";
import { SiteMeterInstallation } from "./SiteMeterInstallation";
import { ReadMethodMBus } from "./ReadMethodMbus";

@ChildEntity()
export class SiteMeterInstallationMBus extends SiteMeterInstallation {
  @ManyToOne(() => ReadMethodMBus, m => m.installations, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public readMethod: ReadMethodMBus

  @Column('int')
  public mbusPrimary: number

  @Column('int', { default: () => 1 })
  public baseReadoutFrequencyDivider: number

}