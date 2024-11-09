import { ChildEntity, Column, OneToMany } from "typeorm"
import { Method } from "./Method"
import { SiteMeterInstallationMBus } from "./SiteMeterInstallationMbus"

@ChildEntity()
export class MethodMBus extends Method {
  @Column('varchar')
  public host: string

  @Column('int')
  public port: number

  @Column('int')
  public timeout: number

  @Column('boolean')
  public autoConnect: boolean

  @Column('int')
  public baseReadoutFrequencyMinutes: number

  @Column('boolean', { default: () => true })
  public enabled: boolean

  @OneToMany(() => SiteMeterInstallationMBus, smi => smi.method)
  public installations: SiteMeterInstallationMBus[]
}