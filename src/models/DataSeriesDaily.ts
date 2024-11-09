import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  Unique,
  Column 
} from "typeorm";
import { DataSeries } from "./DataSeries";

  
@Entity()
@Unique(['dataSeries', 'localTime'])
export class DataSeriesDaily {
  @PrimaryGeneratedColumn()
  public readonly id: number
  
  @ManyToOne(() => DataSeries, ds => ds.daily, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries

  @Column("datetime", { 
    precision: 0, 
    nullable: false
  })
  public localTime: Date 

  @Column('int', { nullable: false })
  public value: number
}