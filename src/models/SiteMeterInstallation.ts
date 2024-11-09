import { 
  ManyToOne, 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  TableInheritance
} from "typeorm"
import { Site } from "./Site"
import { Meter } from "./Meter"
import { Method } from "./Method"

@Entity()
@TableInheritance({ column : { type: 'varchar', name: 'methodType'}})
export class SiteMeterInstallation {
  @PrimaryGeneratedColumn()
  public id: number
  
  @ManyToOne(() => Site, s => s.installations)
  public site: Site

  @ManyToOne(() => Meter, m => m.installations)
  public meter: Meter

  @ManyToOne(() => Method, m => m.installations)
  public method: Method

  @Column('datetime', { 
    precision: 0, 
    default: () => 'CURRENT_TIMESTAMP(0)' 
  })
  public installationUTCTime: Date

  @Column('datetime', { 
    precision: 0, 
    nullable: true
  })
  public removalUTCTime: Date

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

// TODO - Triggers / consistency checks 
// !! Check - copied from Meter Installation !!
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