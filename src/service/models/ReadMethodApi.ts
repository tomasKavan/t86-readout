import { ChildEntity, Column, OneToMany } from "typeorm"
import { SiteMeterInstallationApi } from "./SiteMeterInstallationApi"
import { ReadMethod } from "./ReadMethod"

@ChildEntity()
export class ReadMethodApi extends ReadMethod {
  @Column('varchar')
  public route: string

  @OneToMany(() => SiteMeterInstallationApi, smi => smi.readMethod)
  public installations: Promise<SiteMeterInstallationApi[]>
}