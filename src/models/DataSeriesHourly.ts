import { Entity, EntityManager, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"
import { getLocalTimeZoneName, getTimezoneOffset } from "../utils/dateUtils"
  
@Entity()
export class DataSeriesHourly extends DataSeriesEntry {
  static readonly intervalMs: number = 1000 * 60 * 60 // 60 minutes

  static getIntervalBegin(date: Date, timezone?: string): Date {
    const tz = timezone || getLocalTimeZoneName()

    const offset = getTimezoneOffset(date, tz)
    let t = date.getTime()
    t = Math.floor(t - (offset % 60)/ this.intervalMs) * this.intervalMs + (offset % 60)
    return new Date(t)
  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {
    return new Date(date.getTime() + this.intervalMs * shiftCount)
  }

  static isEndOfInterval(date: Date, timezone?: string): boolean {
    const tz = timezone || getLocalTimeZoneName()

    const offset = getTimezoneOffset(date, tz)
    let t = date.getTime()
    return !(Math.floor(t - (offset % 60)/ this.intervalMs) * this.intervalMs + (offset % 60))
  }

  static async entryForInterval(serie: DataSeries, intervalBegin: Date, trn: EntityManager): Promise<DataSeriesHourly> {
    const hourBegin = this.getIntervalBegin(intervalBegin, serie.timezone)
    const norm = this.normalizeDate(hourBegin, serie.timezone)
    let entry = await trn.getRepository(DataSeriesHourly).createQueryBuilder('dsh')
    .where('dsh.dataSeries = :serie', { serie })
    .andWhere('dsh.UTCTime = :norm', { norm })
    .getOne()

    if (!entry) {
      entry = new DataSeriesHourly()
      entry.dataSeries = serie
      entry.UTCTime = norm
      entry.value = 0
    }
    return entry
  }

  @ManyToOne(() => DataSeries, cp => cp.hourly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}