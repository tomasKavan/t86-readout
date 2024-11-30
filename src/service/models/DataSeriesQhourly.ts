import { Entity, EntityManager, ManyToOne } from "typeorm"
import { DataSeries } from "./DataSeries"
import { DataSeriesEntry } from "./DataSeriesEntry"
  
@Entity()
export class DataSeriesQhourly extends DataSeriesEntry {
  static readonly intervalMs: number = 1000 * 60 * 15 // 15 minutes

  static getIntervalBegin(date: Date, timezone?: string): Date {
    return new Date(Math.floor(date.getTime() / this.intervalMs) * this.intervalMs)
  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {
    return new Date(date.getTime() + this.intervalMs * shiftCount)
  }

  static isEndOfInterval(date: Date, timezone?: string): boolean {
    return !(date.getTime() % this.intervalMs)
  }

  static async entryForInterval(serie: DataSeries, intervalBegin: Date, trn: EntityManager): Promise<DataSeriesQhourly> {
    const norm = this.normalizeDate(intervalBegin, serie.timezone)
    let entry = await trn.getRepository(DataSeriesQhourly).createQueryBuilder('dsq')
    .where('dsq.dataSeries = :serie', { serie })
    .andWhere('dsq.UTCTime = :norm', { norm })
    .getOne()

    if (!entry) {
      entry = new DataSeriesQhourly()
      entry.dataSeries = serie
      entry.UTCTime = norm
      entry.value = 0
    }
    return entry
  }

  @ManyToOne(() => DataSeries, cp => cp.qhourly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public dataSeries: DataSeries
}

