import { Column, Entity, Unique, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { MeterType } from "./MeterType";
import { MeterInstallation } from "./MeterInstallation";

@Entity()
@Unique(['type', 'serialNumber'])
export class Meter {
  @PrimaryGeneratedColumn()
  public readonly id: number

  @ManyToOne(() => MeterType, (mt) => mt.meters, {
    eager: true, 
    onDelete: 'RESTRICT', 
    nullable: false
  })
  public type: MeterType

  @Column('varchar')
  public serialNumber: string

  @Column('int')
  public mbusSecondary: number

  @Column('text')
  public notes: string

  @OneToMany(() => MeterInstallation, mi => mi.meter)
  public installations: MeterInstallation[]
}