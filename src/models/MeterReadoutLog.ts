import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Meter } from "./Meter";
import { MeterInstallation } from "./MeterInstallation";

export enum ReadoutLogEntryStatus {
  OK = 'ok',
  ERROR = 'error'
}

@Entity()
@Unique(['installation', 'time'])
export class MeterReadoutLog {
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => MeterInstallation, mi => mi.log, {
    onDelete: 'CASCADE',
    nullable: false
  })
  public installation: MeterInstallation

  @Column("datetime")
  public time: Date

  @Column('enum', { 
    enum: ReadoutLogEntryStatus, 
    default: ReadoutLogEntryStatus.OK
  })
  public status: ReadoutLogEntryStatus

  @Column("varchar", { length: 255, nullable: true })
  public error: string

  @Column('datetime', {nullable: true})
  public meterTimestamp: Date

  @Column('bigint', {default: 0})
  public value: number
}