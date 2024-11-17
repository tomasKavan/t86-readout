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
export class ReadMethod {
  @PrimaryColumn('varchar', { length: 16 })
  public id: string

  @OneToMany(() => SiteMeterInstallation, smi => smi.readMethod)
  public installations: Promise<SiteMeterInstallation[]>

  @Column('text')
  public description: string

  @Column('boolean', { default: () => true })
  public enabled: boolean

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