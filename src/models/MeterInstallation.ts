import { 
  Column, 
  Entity, 
  ManyToOne, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn } from "typeorm";
import { ConsumptionPlace } from "./ConsumptionPlace";
import { Meter } from "./Meter";
import { MeterReadoutLog } from "./MeterReadoutLog";

@Entity()
export class MeterInstallation{
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => ConsumptionPlace, cp => cp.installedMeters, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false
  })
  public consumptionPlace: ConsumptionPlace

  @ManyToOne(() => Meter, m => m.installations, {
    eager: true,
    onDelete: 'RESTRICT',
    nullable: false
  })
  public meter: Meter

  @OneToMany(() => MeterReadoutLog, mrl => mrl.installation)
  public log: MeterReadoutLog[]

  @Column("datetime", {default: '2024-06-01 00:00:00'})
  public installation: Date

  @Column("datetime", {nullable: true})
  public removal: Date

  @Column("datetime", {nullable: true})
  public lockedReadoutBefore: Date

  @Column("text")
  public notes: string

  @CreateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)'
  })
  createdTime: Date

  @UpdateDateColumn({
    type: 'datetime',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)'
  })
  updatedTime: Date
}

// TODO - Triggers / consistency checks
//
// 1. One place can have only 1 meter installed at a time.
//    Check CREATE, UPDATE[installation, removal].
// 2. LockedReadoutBefore can be only within installation interval.
//    Check CREATE, UPDATE[installation, removal, lockedReadoutBefore].
// 3. SET of lockedReadoutBefore deletes all processed consumption
//    latter than new lockedReadoutBefore value. Also all newer installations'
//    lockedReadoutBefore must become nulled.
// 4. When DELETED all consumptions after (including) installation date must be
//    also deleted and all newer installations' lockedReadoutBefore must 
//    become nulled.