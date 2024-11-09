import { 
  Column, 
  Entity, 
  ManyToOne, 
  OneToMany,
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  TableInheritance
} from "typeorm"
import { Function, Unit } from "./SiteCharacteristic"
import { MeterType } from "./MeterType"
import { SiteMeterInstallationMap } from "./SiteMeterInstallationMap"

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'methodType' }})
export class MeterTypeUnit {
  @PrimaryGeneratedColumn()
  public id: number

  @Column('varchar')
  public name: string

  @Column('enum', { enum: Function })
  public function: Function

  @Column('enum', { enum: Unit })
  public unit: Unit

  @Column('int', { default: () => 0 })
  public rescaleOrder: number

  @ManyToOne(() => MeterType, mt => mt.units)
  public meterType: MeterType

  @OneToMany(() => SiteMeterInstallationMap, smim => smim.meterTypeUnit)
  public installationMap: SiteMeterInstallationMap

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