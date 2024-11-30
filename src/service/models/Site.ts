import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn 
} from "typeorm";
import { SiteCharacteristic } from "./SiteCharacteristic";
import { SiteMeterInstallation } from "./SiteMeterInstallation";

@Entity()
export class Site {
  @PrimaryColumn('varchar', { length: 16 })
  public id: string

  @Column('varchar')
  public name: string

  @Column('varchar')
  public installationRoomNumber: string

  @Column('text')
  public installationDetails: string

  @OneToMany(() => SiteCharacteristic, sc => sc.site)
  public characteristics: SiteCharacteristic[]

  @OneToMany(() => SiteMeterInstallation, smi => smi.site)
  public installations: Promise<SiteMeterInstallation[]>

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