import { Entity, EntityManager, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"
import { getLocalTimeZoneName } from "../utils/dateUtils"
  
@Entity()
export class DataSeriesMonthly extends DataSeriesEntry {
  static readonly intervalMs: number = 0 // Error: Month doesn't have one interval. Must be calculated based on specific date

  static getIntervalBegin(date: Date, timezone?: string): Date {
    const tz = timezone || getLocalTimeZoneName()

    const d = new Date(date.toLocaleDateString('en-US', { timeZone: timezone}))
    d.setUTCMonth(0)
    return d
  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {
    const tz = timezone || getLocalTimeZoneName()
    const beg = this.getIntervalBegin(date, timezone)
    const diff = date.getTime() - beg.getTime()

    beg.setUTCMonth(beg.getUTCMonth() + shiftCount)

    return new Date(diff + beg.getTime())
  }

  static isEndOfInterval(date: Date, timezone?: string): boolean {
    const tz = timezone || getLocalTimeZoneName()
    return this.getIntervalEnd(date, tz).getTime() === date.getTime()
  }

  static async entryForInterval(serie: DataSeries, intervalBegin: Date, trn: EntityManager): Promise<DataSeriesMonthly> {
    const monthBegin = this.getIntervalBegin(intervalBegin, serie.timezone)
    let entry = await trn.getRepository(DataSeriesMonthly).createQueryBuilder('dsd')
    .where('dsd.dataSeries = :serie', { serie })
    .andWhere('dsd.UTCTime = :monthBegin', { monthBegin })
    .getOne()

    if (!entry) {
      entry = new DataSeriesMonthly()
      entry.dataSeries = serie
      entry.UTCTime = monthBegin
      entry.value = 0
    }
    return entry
  }

  @ManyToOne(() => DataSeries, ds => ds.monthly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}