import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  Column, 
  Unique
} from "typeorm"
import { DataSeries } from "./DataSeries"
  
@Entity()
@Unique(['dataSeries', 'localTime'])
export class DataSeriesQhourly {
  @PrimaryGeneratedColumn()
  public readonly id: number
  
  @ManyToOne(() => DataSeries, cp => cp.qhourly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries

  @Column("datetime", {
    nullable: false,
    precision: 0
  })
  public localTime: Date 

  @Column("int", { nullable: false })
  public value: number
}