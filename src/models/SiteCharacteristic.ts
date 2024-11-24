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

export enum CharacteristicType {
  ELECTRICITY = 'elec',
  NATURAL_GAS = 'ngas',
  COLD_WATER = 'cwat',
  HOT_WATER = 'hwat',
  HEAT = 'heat',
  TEMPERATURE = 'temp',
  REL_HUMIDITY = 'rhum',
  BRIGHTNESS = 'brtn',
  PRESSURE = 'pres',
  VOC = 'voc',
  CO2 = 'co2'
}

export enum Unit {
  CUBIC_METER = 'm3',
  WATT_HOUR = 'Wh',
  SECOND = 's',
  CELSIUS = 'degC',
  PERCENT = '%',
  LUX = 'lx',
  PASCAL = 'Pa',
  AIR_QUALITY = 'AQ'
}

export function characteristicTypeUnit(charType: CharacteristicType): string | null {
  switch (charType) {
    case CharacteristicType.ELECTRICITY:
    case CharacteristicType.NATURAL_GAS:
    case CharacteristicType.HEAT:
      return Unit.WATT_HOUR
    case CharacteristicType.HOT_WATER:
    case CharacteristicType.COLD_WATER:
      return Unit.CUBIC_METER
    case CharacteristicType.TEMPERATURE:
      return Unit.CELSIUS
    case CharacteristicType.REL_HUMIDITY:
    case CharacteristicType.CO2:
      return Unit.PERCENT
    case CharacteristicType.BRIGHTNESS:
      return Unit.LUX
    case CharacteristicType.PRESSURE:
      return Unit.PASCAL
    case CharacteristicType.VOC:
      return Unit.AIR_QUALITY
  }
  throw new Error(`Unknown Charasteristic: ${charType}`)
}

export enum Function {
  INSTANT = 'instant',
  MAX = 'max',
  MIN = 'min',
  AVERAGE = 'avg'
}

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

  @Column('enum', { enum: Function, default: () => Function.INSTANT })
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
