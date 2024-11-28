import { Entity, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"

@Entity()
export class DataSeriesDaily extends DataSeriesEntry {
  @ManyToOne(() => DataSeries, ds => ds.daily, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}