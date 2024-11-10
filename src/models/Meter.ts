import { 
  Column, 
  Entity, 
  Unique, 
  OneToMany, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn 
} from "typeorm"
import { MeterType } from "./MeterType"
import { SiteMeterInstallation } from "./SiteMeterInstallation"

@Entity()
@Unique(['type', 'serialNumber'])
export class Meter {
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => MeterType, (mt) => mt.meters, {
    eager: true, 
    onDelete: 'RESTRICT', 
    nullable: false
  })
  public type: MeterType

  @Column('varchar')
  public serialNumber: string

  @Column('text')
  public notes: string

  @OneToMany(() => SiteMeterInstallation, smi => smi.meter)
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