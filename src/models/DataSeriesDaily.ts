import { Entity, EntityManager, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"
import { getLocalTimeZoneName } from "../utils/dateUtils"

@Entity()
export class DataSeriesDaily extends DataSeriesEntry {
  static readonly intervalMs: number = 0 // Error: Month doesn't have one interval (may have 23, 24 and 25 hours)

  static getIntervalBegin(date: Date, timezone?: string): Date {
    const tz = timezone || getLocalTimeZoneName()

    return new Date(date.toLocaleDateString('en-US', { timeZone: timezone}))
  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {
    const tz = timezone || getLocalTimeZoneName()
    const beg = this.getIntervalBegin(date, timezone)
    const diff = date.getTime() - beg.getTime()

    beg.setUTCDate(beg.getUTCDate() + shiftCount)

    return new Date(diff + beg.getTime())
  }

  static isEndOfInterval(date: Date, timezone?: string): boolean {
    const tz = timezone || getLocalTimeZoneName()
    return this.getIntervalEnd(date, tz).getTime() === date.getTime()
  }

  static async entryForInterval(serie: DataSeries, intervalBegin: Date, trn: EntityManager): Promise<DataSeriesDaily> {
    const dayBegin = this.getIntervalBegin(intervalBegin, serie.timezone)
    let entry = await trn.getRepository(DataSeriesDaily).createQueryBuilder('dsd')
    .where('dsd.dataSeries = :serie', { serie })
    .andWhere('dsd.UTCTime = :dayBegin', { dayBegin })
    .getOne()

    if (!entry) {
      entry = new DataSeriesDaily()
      entry.dataSeries = serie
      entry.UTCTime = dayBegin
      entry.value = 0
    }
    return entry
  }

  @ManyToOne(() => DataSeries, ds => ds.daily, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}