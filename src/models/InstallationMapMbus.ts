import { ChildEntity, ManyToOne } from "typeorm"
import { InstallationMap } from "./InstallationMap"
import { MeterTypeUnitMbus } from "./MeterTypeUnitMbus"

@ChildEntity()
export class InstallationMapMbus extends InstallationMap {
  @ManyToOne(() => MeterTypeUnitMbus, mtu => mtu.installationMap, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public meterTypeUnit: MeterTypeUnitMbus
}