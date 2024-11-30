import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne,
  OneToMany
} from "typeorm"
import { Site } from "./Site"
import { InstallationMap } from "./InstallationMap"
import { SiteLog } from "./SiteLog"
import { DataSeries } from "./DataSeries"
import { CharacteristicType, Function, Unit } from "./SiteCharacteristicEnums"



@Entity()
export class SiteCharacteristic {
  @PrimaryGeneratedColumn()
  public id: number

  @ManyToOne(() => Site, s => s.characteristics)
  public site: Site

  @Column('enum', { enum: CharacteristicType })
  public type: CharacteristicType

  @Column('enum', { enum: Unit })
  public unit: Unit

  @Column('enum', { enum: Function })
  public function: Function

  @Column('varchar')
  public description: string

  @OneToMany(() => InstallationMap, smim => smim.siteCharacteristic)
  public map: Promise<InstallationMap[]>

  @OneToMany(() => SiteLog, sl => sl.characteristic)
  public log: Promise<SiteLog[]>

  @OneToMany(() => DataSeries, ds => ds.siteCharacteristic)
  public dataSeries: Promise<DataSeries[]>

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
