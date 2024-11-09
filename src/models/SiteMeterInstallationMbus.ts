import { ChildEntity, Column, ManyToOne } from "typeorm";
import { SiteMeterInstallation } from "./SiteMeterInstallation";
import { MethodMBus } from "./MethodMbus";

@ChildEntity()
export class SiteMeterInstallationMBus extends SiteMeterInstallation {
  @ManyToOne(() => MethodMBus, m => m.installations, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public method: MethodMBus

  @Column('int')
  public mbusPrimary: number

  @Column('int', { default: () => 1 })
  public baseReadoutFrequencyMultiplier: number

}