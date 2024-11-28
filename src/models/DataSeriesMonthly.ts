import { Entity, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"
  
@Entity()
export class DataSeriesMonthly extends DataSeriesEntry {
  @ManyToOne(() => DataSeries, ds => ds.monthly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}