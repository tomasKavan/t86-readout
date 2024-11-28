import { Entity, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"
  
@Entity()
export class DataSeriesHourly extends DataSeriesEntry {
  @ManyToOne(() => DataSeries, cp => cp.hourly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}