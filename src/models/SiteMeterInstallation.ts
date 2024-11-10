import { 
  ManyToOne, 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  TableInheritance,
  OneToMany,
  BeforeInsert,
  getRepository,
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  LessThan,
  MoreThanOrEqual,
  UpdateEvent,
  MoreThan
} from "typeorm"
import { Site } from "./Site"
import { Meter } from "./Meter"
import { Method } from "./Method"
import { SiteLog } from "./SiteLog"
import { SiteMeterInstallationMap } from "./SiteMeterInstallationMap"

@Entity()
@TableInheritance({ column : { type: 'varchar', name: 'methodType'}})
export class SiteMeterInstallation {
  @PrimaryGeneratedColumn()
  public id: number
  
  @ManyToOne(() => Site, s => s.installations, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public site: Site

  @ManyToOne(() => Meter, m => m.installations, {
    onDelete: 'RESTRICT',
    nullable: true
  })
  public meter: Meter

  @ManyToOne(() => Method, m => m.installations, {
    onDelete: 'RESTRICT',
    nullable: true
  })
  public method: Method

  @Column('datetime', { 
    precision: 0, 
    default: () => 'CURRENT_TIMESTAMP(0)' 
  })
  public installationUTCTime: Date

  @Column('datetime', { 
    precision: 0, 
    nullable: true
  })
  public removalUTCTime: Date

  @OneToMany(() => SiteLog, sl => sl.siteMeterInstallation)
  public log: Promise<SiteLog[]>

  @OneToMany(() => SiteMeterInstallationMap, smim => smim.installation)
  public map: SiteMeterInstallationMap[]

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

@EventSubscriber()
export class SiteMeterInstallationTriggers 
implements EntitySubscriberInterface<SiteMeterInstallation> {
  listenTo() {
    return SiteMeterInstallation
  }

  async beforeInsert(event: InsertEvent<SiteMeterInstallation>) {
    const repo = event.manager.getRepository(SiteMeterInstallation)
    
    // All previsous Installations must be removed (remove time is set)
    const openInstallation = await repo.findOne({ where: { removalUTCTime: null }})
    if (openInstallation) {
      throw new Error(`Can't INSERT new meter Installation on Site (${event.entity.site.id}) while another Installation (${openInstallation.id}) is there`)
    }

    // 'installationUTCTime' is newer than any 'removalUTCTime' of other Installations
    const newerInstallation = await repo.findOne({ 
      where: { removalUTCTime: MoreThanOrEqual(event.entity.installationUTCTime) }
    })
    if (newerInstallation) {
      throw new Error(`Can't INSERT new meter Installation on Site (${event.entity.site.id}) while another Installation (${newerInstallation.id}) hasn't ended at the time of installation (${event.entity.installationUTCTime})`)
    }

    // 'removalUTCTime' must be NULL or newer than 'installationUTCTime'
    if (event.entity.removalUTCTime !== null 
      && event.entity.removalUTCTime <= event.entity.installationUTCTime) {
        throw new Error(`Can't INSERT new meter Installation on Site (${event.entity.site.id}) whith removal date ${event.entity.removalUTCTime} newer than installation date (${event.entity.installationUTCTime})`)
    }

    // Ales gute
  }

  async beforeUpdate(event: UpdateEvent<SiteMeterInstallation>) {
    // 'installationUTCTime' can be adjusted only when 'log' is empty
    if(event.updatedColumns.find(el => el.propertyName === 'installationUTCTime')
      && await event.manager.count(SiteLog, {
        where: { siteMeterInstallation: event.entity }
      })) {
      throw new Error(`Can't UPDATE 'installationUTCTime' of Installation (${event.entity.id}, because Installation has already some logs.)`)
    }

    // 'installationUTCTime' can be adjusted only when it is newest installation
    // and must be newer than previous installation 'removalUTCTime'
    if (await event.manager.find(SiteMeterInstallation, { 
      where: [
        { installationUTCTime: MoreThan(event.entity.installationUTCTime) },
        { removalUTCTime: MoreThan(event.entity.installationUTCTime) }
      ]
    })) {
      throw new Error(`Can't UPDATE 'installationUTCTime' of Installation (${event.entity.id} to ${event.entity.installationUTCTime}, because there is already Installation with newer installation/removalUTCTime`)
    }

    // 'removalUTCTime' must be NULL or newer than 'installationUTCTime'
    if (event.entity.removalUTCTime !== null 
      && event.entity.removalUTCTime <= event.entity.installationUTCTime) {
        throw new Error(`Can't UPDATE Installation (${event.entity.id}) whith removal date ${event.entity.removalUTCTime} newer than installation date (${event.entity.installationUTCTime})`)
    }

    // Soft - delete all logs after removalUTCTime
    if (event.updatedColumns.find(el => el.propertyName === 'removalUTCTime')
      && event.entity.removalUTCTime !== null) {
      await event.manager.softDelete(SiteLog, {
        where: {
          SiteMeterInstallation: event.entity,
          logUTCTime: MoreThan(event.entity.removalUTCTime)
        }
      })
    }

    // Ales gute
  }
}
