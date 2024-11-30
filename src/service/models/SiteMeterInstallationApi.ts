import { ChildEntity, ManyToOne } from "typeorm";
import { SiteMeterInstallation } from "./SiteMeterInstallation";
import { ReadMethodApi } from "./ReadMethodApi";

@ChildEntity()
export class SiteMeterInstallationApi extends SiteMeterInstallation {
  @ManyToOne(() => ReadMethodApi, m => m.installations, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public method: ReadMethodApi
}