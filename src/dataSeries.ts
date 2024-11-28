import { DataSource, EntityManager } from "typeorm"
import { CronScheduler, CronSchedulerTask } from "./CronScheduler"
import { DataSeries, DataSeriesDaily, DataSeriesHourly, DataSeriesMonthly, DataSeriesQhourly, SiteMeterInstallation } from "./models"
import { SiteLog } from "./models/SiteLog"

export type DataSeriesConfigOptions = {
  processOnMinute: number,
  onStart: boolean,
  skipQHoursFromNow: number
}

const PROCESSING_INTERVAL_MS = 1000 * 60 * 15 // 15 minutes
const TICK_INTERVAL_MS = 1000 * 60 // 1 minute

export default function DataSeriesScheduler(dataSource: DataSource, config: DataSeriesConfigOptions) {
  let intervalId = null
  let runningPromise: Promise<void> | null = null
  const processMinuteInQHour = Math.max(Math.min(config.processOnMinute, 14), 0)

  function enable() {
    if (intervalId) {
      return
    }

    if (config.onStart) {
      processDataSeries()
    }

    intervalId = setTimeout(tick, TICK_INTERVAL_MS)
  }

  function disable() {
    if (!intervalId) {
      return
    }

    clearInterval(intervalId)
    intervalId = null
  }

  async function tick() {
    if (shouldRunNow()) {
      processDataSeries()
    } 
  }

  async function processDataSeries() {
    if (runningPromise) {
      return runningPromise
    }

    runningPromise = _callProcessDataSeries()
    return runningPromise
  }

  async function _callProcessDataSeries() {
    // List all Data series (where processingEnabled == true & in interval (startUTCTime, endUTCTime))
    // For each data serie
    // - Select odlest log.logUTCTime from logs with log.updatedUTCTime > processedUntilUTCTime
    // - Round (floor) it to the quarter hours 
    // - Delete all processed data in serie newer than it and set it to processedUntilUTCTime
    // - Make a queue of qhours to process from processedUntilUTCTime to now - 15 * config.skipQHoursFromNow
    //   Order it chronologicaly from the oldest

    // For each qhour to process
    // - Find all relevant installations
    // - Load all logs in the qhour + 1 newest before
    // - For each installation
    //   - Substract value of the first log from the last log and add it to the qhour sum
    // - If it's last qhour of a hour - process hour
    // - If it's last qhour of a day - process day
    // - If it's last qhour of a month - process month
    // - In DB transaction insert all qhour, hour, day and month values and update processedUntilUTCTime

    const now = new Date()
    const processUntilQhour = qhourShift(qhourBegin(now), -config.skipQHoursFromNow)
    const processUntilQhourEnd = qhourShift(processUntilQhour, 1)
    const mgr = dataSource.manager

    const series = await mgr.getRepository(DataSeries).createQueryBuilder('ds')
      .leftJoinAndSelect('ds.siteCharacteristic', 'sc')
      .leftJoinAndSelect('sc.site', 's')
      .where('ds.processingEnabled === TRUE')
      .getMany()
    
    for (const serie of series) {
      const log = await mgr.getRepository(SiteLog).createQueryBuilder('sl')
        .where('sl.updatedUTCTime > :date AND sl.logUTCTime < :endDate', { 
          date: serie.updatesProcessedUntilUTCTime,
          endDate: serie.lastProcessedUTCQhour
        })
        .orderBy('sl.logUTCTime', 'ASC')
        .limit(1)
        .getOne()
      
      // We found log entry changed later than lastProcessedUTCQhour
      // PUSH lastProcessedUTCQhour and delete all serie data until this time
      // !! Be aware serie data are in local time. Once a year we must push 
      //    processedUntilUTCTime even one hour further (DST -> STD)
      if (log) {
        serie.lastProcessedUTCQhour = qhourBegin(log.logUTCTime)

        if (isInDSTtoSTDTransition(serie.lastProcessedUTCQhour, serie.timezone)) {
          serie.lastProcessedUTCQhour = hoursShift(serie.lastProcessedUTCQhour, -1)
        }

        const beginOf = {
          qhour: qhourBegin(serie.lastProcessedUTCQhour),
          hour: hourBegin(serie.lastProcessedUTCQhour),
          day: dayBegin(serie.lastProcessedUTCQhour),
          month: monthBegin(serie.lastProcessedUTCQhour)
        }

        // do all in 1 transaction
        try {
          await mgr.transaction(async (trnMng) => {
            // save new processedUntilUTCTime
            await trnMng.getRepository(DataSeries).save(serie)

            

            // delete all abundant qhours
            await trnMng.getRepository(DataSeriesQhourly).createQueryBuilder()
              .delete()
              .from(DataSeriesQhourly)
              .where('dataSeries = :dsId AND UTCTime >= :date', {
                dsId: serie.id,
                date: sqlTimeStringWithTimezone(beginOf.qhour, serie.timezone)
              })
              .execute()

            // delete all abundant hours
            await trnMng.getRepository(DataSeriesHourly).createQueryBuilder()
              .delete()
              .from(DataSeriesHourly)
              .where('dataSeries = :dsId AND UTCTime >= :date', {
                dsId: serie.id,
                date: sqlTimeStringWithTimezone(beginOf.hour, serie.timezone)
              })
              .execute()

            // delete all abundant days
            await trnMng.getRepository(DataSeriesDaily).createQueryBuilder()
              .delete()
              .from(DataSeriesDaily)
              .where('dataSeries = :dsId AND UTCTime >= :date', {
                dsId: serie.id,
                date: sqlTimeStringWithTimezone(beginOf.day, serie.timezone)
              })
              .execute()

            // delete all abundant months
            await trnMng.getRepository(DataSeriesMonthly).createQueryBuilder()
              .delete()
              .from(DataSeriesMonthly)
              .where('dataSeries = :dsId AND UTCTime >= :date', {
                dsId: serie.id,
                date: sqlTimeStringWithTimezone(beginOf.month, serie.timezone)
              })
              .execute()
          })
        } catch (e) {
          console.log(`[DataSeries Processor]: Unable to process serie (${serie.id}). Due to error when pushing back processedUntilUTCTime. ${e}`)
          continue
        }
      }
      
      let qhour = serie.lastProcessedUTCQhour
      while(qhour <= processUntilQhour) {
        const qhourEnd = qhourShift(qhour, 1)

        await mgr.transaction(async (trn) => {
          // Select all relevant installations
          const installs = await trn.getRepository(SiteMeterInstallation)
            .createQueryBuilder('smi')
            .leftJoinAndSelect('smi.meter', 'm')
            .leftJoinAndSelect('m.type', 'mt')
            .leftJoinAndSelect('smi.map', 'map')
            .leftJoinAndSelect('map.siteCharacteristic', 'sc')
            .leftJoinAndSelect('map.meterTypeUnit', 'mtu')
            .where('smi.site = :site', { site: serie.siteCharacteristic.site })
            .andWhere('smi.installationUTCTime IS NULL OR smi.installationUTCTime <= :qhBeg', { gBeg: qhour })
            .andWhere('smi.removalUTCTime IS NULL OR smi.removalUTCTime >= :qhEnd', { qEnd: qhourEnd })
            .getMany()

          // TODO - other processing methods than DIFFERENCE
          let value = 0

          // Iterate over all relevant installations and add diferences to the overal value
          for (const inst of installs) {
            const logsIn = await trn.getRepository(SiteLog)
              .createQueryBuilder('sl')
              .where('sl.siteMeterInstallation = :smi', { smi: inst })
              .where('sl.characteristic = :c', { c: serie.siteCharacteristic })
              .where('sl.logUTCTime >= :beg AND sl.logUTCTime < :end', { beg: qhour, end: qhourEnd})
              .getMany()
            const logOut = await trn.getRepository(SiteLog)
              .createQueryBuilder('sl')
              .where('sl.siteMeterInstallation = :smi', { smi: inst })
              .where('sl.characteristic = :c', { c: serie.siteCharacteristic })
              .where('sl.logUTCTime < :beg', { beg: qhour } )
              .orderBy('sl.logUTCTime', 'DESC')
              .limit(1)
              .getOne()
            
              // Not enough readouts to calculate consumption
              if ((!logOut && logsIn.length < 2) || (logOut && logsIn.length < 1)) {
                continue
              }

              // Calculate consumption and add it to overal value
              const firstLog = logOut || logsIn[0]
              const lastLog = logsIn[logsIn.length - 1]
              value += lastLog.value - firstLog.value
          }

          // If overal value is not 0 save it
          if (value != 0) {
            const input = await qhourEntryForUTCTime(serie, qhour, trn)
            input.value += value
            trn.getRepository(DataSeriesQhourly).save(input)
          }

          await agregateValue<DataSeriesHourly>(serie, qhour, trn)
          await agregateValue<DataSeriesDaily>(serie, qhour, trn)
          await agregateValue<DataSeriesMonthly>(serie, qhour, trn)

          if (hourEndsAt(qhourEnd)) {
            const hb = hourBegin(qhour)
            const input = await hourEntryForUTCTime(serie, hb, trn)
            input.value = await agregateValue(serie, hb, hoursShift(hb, 1), trn)
            trn.getRepository(DataSeriesHourly).save(input)
          }

          if (dayEndsAt(qhourEnd)) {
            const hb = dayBegin(qhour)
            const input = await dayEntryForUTCTime(serie, hb, trn)
            input.value = await agregateValue(serie, hb, dayShift(hb, 1), trn)
            trn.getRepository(DataSeriesDaily).save(input)
          }

          if (monthEndsAt(qhourEnd)) {
            const hb = monthBegin(qhour)
            const input = await monthEntryForUTCTime(serie, hb, trn)
            input.value = await agregateValue(serie, hb, monthShift(hb, 1), trn)
            trn.getRepository(DataSeriesDaily).save(input)
          }

          // push lastProcessedUTCQhour forward
          
          serie.lastProcessedUTCQhour = qhour
          trn.getRepository(DataSeries).save(serie)

          // move to the next qhour
          qhour = qhourShift(qhour, 1)
        })
      }

      serie.updatesProcessedUntilUTCTime = now
      mgr.getRepository(DataSeries).save(serie)
    }

    runningPromise = null
  }

  async function agregateValue(serie: DataSeries, start: Date, end: Date, trn?: EntityManager): Promise<number> {
    const mgr = trn || dataSource.manager

    const list = await mgr.getRepository(DataSeriesQhourly).createQueryBuilder('dsq')
    .where('dsq.dataSeries = :serie AND localTime >= :beg AND localTime < :end', {
      serie: serie,
      beg: sqlTimeStringWithTimezone(start, serie.timezone),
      end: sqlTimeStringWithTimezone(end, serie.timezone)
    })
    .getMany()

    return list.reduce((cnt, item) => {
      return cnt + item.value
    }, 0)
  }

  function shouldRunNow(): boolean {
    const now = new Date()
    const minutes = now.getUTCMinutes()
    return !((minutes - processMinuteInQHour) % 15)
  }

  const QHOUR_MS = 1000 * 60 * 15
  function qhourBegin(utcDate: Date): Date {
    return new Date((Math.floor(utcDate.getTime() / QHOUR_MS))* QHOUR_MS) 
  }

  const HOUR_MS = QHOUR_MS * 4
  function hourBegin(utcDate:Date): Date {
    return new Date((Math.floor(utcDate.getTime() / HOUR_MS))* HOUR_MS) 
  }

  const DAY_MS = HOUR_MS * 24
  function dayBegin(utcDate:Date): Date {
    return new Date((Math.floor(utcDate.getTime() / DAY_MS))* DAY_MS) 
  }

  function monthBegin(utcDate: Date): Date {
    const db = dayBegin(utcDate)
    db.setDate(0)
    return db
  }

  function isInDSTtoSTDTransition(utcDate: Date, timezone: string): boolean {

  }

  function qhourShift(utcDate: Date, shift: number): Date {

  }

  function hoursShift(utcDate: Date, shift: number): Date {

  }

  function sqlTimeStringWithTimezone(utcDate: Date, timezone: string): string {

  }

  async function qhourEntryForUTCTime(serie: DataSeries, qhour: Date, trn: EntityManager): DataSeriesQhourly {

  }

  async function hourEntryForUTCTime(serie: DataSeries, qhour: Date, trn: EntityManager): DataSeriesHourly {

  }

  async function dayEntryForUTCTime(serie: DataSeries, qhour: Date, trn: EntityManager): DataSeriesDaily {

  }

  async function monthlyEntryForUTCTime(serie: DataSeries, qhour: Date, trn: EntityManager): DataSeriesMonthly {

  }

  return {
    enable,
    disable
  }
}