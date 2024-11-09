import { 
  Column, 
  Entity, 
  PrimaryColumn, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn, 
  TableInheritance
} from "typeorm";
  import { SiteMeterInstallation } from "./SiteMeterInstallation"

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' }})
export class Method {
  @PrimaryColumn('varchar', { length: 16 })
  public id: string

  @OneToMany(() => SiteMeterInstallation, smi => smi.method)
  public installations: SiteMeterInstallation[]

  @Column('text')
  public description: string

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