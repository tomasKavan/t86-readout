import { BaseEntity, PrimaryGeneratedColumn, Column, Unique, EntityManager } from "typeorm";
import { DataSeries } from "./DataSeries";
import { getLocalTimeZoneName, isAmbiguous, normalizeAmbiguosDate } from "../utils/dateUtils";

export type EntryInterval = {
  begin: Date,
  end: Date
}

export interface DataSeriesEntryStatic {
  new(): DataSeriesEntry 

  getInterval(date: Date, timezone?: string): EntryInterval
  getIntervalBegin(date: Date, timezone?: string): Date
  getIntervalEnd(date: Date, timezone?: string): Date 

  isAmbiguousInterval(date: Date | EntryInterval, timezone?: string): boolean
  normalizeDate(date: Date, timezone?: string): Date
  normalizeInterval(interval: EntryInterval, timezone?: string): EntryInterval

  intervalShift(date: Date, shiftCount: number, timezone?: string ): Date
  isEndOfInterval(date: Date, timezone?: string): boolean

  entryForInterval(serie: DataSeries, intervalBegin: Date, trn: EntityManager): Promise<DataSeriesEntry>
}

@Unique(['dataSeries', 'UTCTime'])
export abstract class DataSeriesEntry extends BaseEntity {
  static getInterval(date: Date, timezone?: string): EntryInterval {
    return {
      begin: this.getIntervalBegin(date, timezone),
      end: this.getIntervalEnd(date, timezone)
    }
  }

  static getIntervalEnd(date: Date, timezone?: string): Date {
    const beg = this.getIntervalBegin(date, timezone)
    return this.intervalShift(beg, 1, timezone)
  }

  static getIntervalBegin(date: Date, timezone?: string): Date {
    throw new Error('[DataSeriesEntry] getIntervalBegin must be implemented in subclass')
  }

  static isAmbiguousInterval(date: Date | EntryInterval, timezone?: string): boolean {
    const tz = timezone || getLocalTimeZoneName()
    if (date instanceof Date) {
      return isAmbiguous(this.getIntervalBegin(date), tz)
    }
    return isAmbiguous(this.getIntervalBegin(date.begin), tz)
  }

  static normalizeDate(date: Date, timezone?: string): Date {
    const tz = timezone || getLocalTimeZoneName()
    return normalizeAmbiguosDate(this.getIntervalBegin(date), tz)
  }

  static normalizeInterval(interval: EntryInterval, timezone?: string): EntryInterval {
    const tz = timezone || getLocalTimeZoneName()
    return {
      begin: normalizeAmbiguosDate(this.getIntervalBegin(interval.begin), tz),
      end: normalizeAmbiguosDate(this.getIntervalBegin(interval.end), tz)
    }
  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {
    throw new Error('[DataSeriesEntry] intervalShift must be implemented in subclass')
  }

  static isEndOfInterval(date: Date, timezone?: string): boolean {
    throw new Error('[DataSeriesEntry] isEndOfInterval must be implemented in subclass')
  }

  static entryForInterval(serie: DataSeries, intervalBegin: Date, trn: EntityManager): Promise<DataSeriesEntry> {
    throw new Error('[DataSeriesEntry] entryForInterval must be implemented in subclass')
  }

  @PrimaryGeneratedColumn()
  public readonly id: number

  public dataSeries: DataSeries

  @Column("datetime", {
    nullable: false,
    precision: 0
  })
  public UTCTime: Date 

  @Column("int", { nullable: false })
  public value: number
  
}