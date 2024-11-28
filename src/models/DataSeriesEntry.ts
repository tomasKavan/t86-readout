import { BaseEntity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { DataSeries } from "./DataSeries";

export type EntryInterval = {
  begin: Date,
  end: Date
}

export interface DataSeriesEntryStatic {
  readonly intervalMs: number

  new(): DataSeriesEntry 

  getInterval(date: Date, timezone?: string): EntryInterval
  getIntervalBegin(date: Date, timezone?: string): Date
  getIntervalEnd(date: Date, timezone?: string): Date 

  intervalShift(date: Date, shiftCount: number, timezone?: string ): Date
}

@Unique(['dataSeries', 'UTCTime'])
export abstract class DataSeriesEntry extends BaseEntity {
  static readonly intervalMs: number = 0

  static getInterval(date: Date, timezone?: string): EntryInterval {
    return {
      begin: this.getIntervalBegin(date, timezone),
      end: this.getIntervalEnd(date, timezone)
    }
  }

  static getIntervalBegin(date: Date, timezone?: string): Date {
    return new Date(Math.floor(date.getTime() / this.intervalMs) * this.intervalMs)
  }

  static getIntervalEnd(date: Date, timezone?: string): Date {
    return this.intervalShift(date, 1, timezone)
  }

  static intervalShift(date: Date, shiftCount: number, timezone?: string ): Date {
    const beg = this.getIntervalBegin(date, timezone).getTime()
    return new Date(beg + this.intervalMs * shiftCount)
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