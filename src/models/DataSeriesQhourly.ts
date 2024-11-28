import { Entity, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry, EntryInterval } from "./DataSeriesEntry"
  
@Entity()
export class DataSeriesQhourly extends DataSeriesEntry {
  static readonly intervalMs: number = 1000 * 60 * 15 // 15 minutes

  static getInterval(date: Date, timezone?: string): EntryInterval {

  }

  static getIntervalBegin(date: Date, timezone?: string): Date {

  }

  static getIntervalEnd(date: Date, timezone?: string): Date {

  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {

  }

  @ManyToOne(() => DataSeries, cp => cp.qhourly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}