import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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
}