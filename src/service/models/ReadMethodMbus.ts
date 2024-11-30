import { ChildEntity, Column, OneToMany } from "typeorm"
import { SiteMeterInstallationMBus } from "./SiteMeterInstallationMbus"
import { ReadMethodScheduled } from "./ReadMethodScheduled"

@ChildEntity()
export class ReadMethodMBus extends ReadMethodScheduled {
  @Column('varchar')
  public host: string

  @Column('int')
  public port: number

  @Column('int')
  public timeout: number

  @Column('boolean')
  public autoConnect: boolean

  @OneToMany(() => SiteMeterInstallationMBus, smi => smi.readMethod)
  public installations: Promise<SiteMeterInstallationMBus[]>
}
