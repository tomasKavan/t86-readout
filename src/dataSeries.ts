import { DataSource, EntityManager } from "typeorm"
import { DataSeries, DataSeriesDaily, DataSeriesHourly, DataSeriesMonthly, DataSeriesQhourly, Site, SiteMeterInstallation } from "./models"
import { SiteLog } from "./models/SiteLog"
import { DataSeriesEntryStatic, DataSeriesEntry } from "./models/DataSeriesEntry"
import { SiteCharacteristic } from "./models/SiteCharacteristic"

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
    const now = new Date()
    const qhourBeginNow = DataSeriesQhourly.getIntervalBegin(now, 'Z')
    const processUntilQhour = DataSeriesQhourly.intervalShift(qhourBeginNow, -config.skipQHoursFromNow, 'Z')
    const mgr = dataSource.manager

    // 1. List all enabled series 
    const series = await mgr.getRepository(DataSeries).createQueryBuilder('ds')
      .leftJoinAndSelect('ds.siteCharacteristic', 'sc')
      .leftJoinAndSelect('sc.site', 's')
      .where('ds.processingEnabled === TRUE')
      .getMany()
    
    // 2. Iterate over series
    for (const serie of series) {
      // 2.1. Check if there is any log entry updated later than last processing of the site
      // If yes, we must push processing of the site to this date and delete all newer processed entries
      const restProcessedUntilUCTime = await findResetUTCTime(serie, mgr)
      if (restProcessedUntilUCTime) {
        try {
          await mgr.transaction(async (trnMng) => {
            const nrest = DataSeriesQhourly.normalizeDate(restProcessedUntilUCTime, serie.timezone)
            serie.lastProcessedUTCQhour = nrest
            await trnMng.getRepository(DataSeries).save(serie)

            // Prune all irelvant (newer than serie.lastProcessedUTCQhour) entries
            await pruneDataEntries(DataSeriesQhourly, serie, trnMng)
            await pruneDataEntries(DataSeriesHourly, serie, trnMng)
            await pruneDataEntries(DataSeriesDaily, serie, trnMng)
            await pruneDataEntries(DataSeriesMonthly, serie, trnMng)
          })
        } catch (e) {
          console.log(`[DataSeries Processor]: Unable to process serie (${serie.id}). Due to error when pushing back processedUntilUTCTime. ${e}`)
          continue
        }
      }
      
      // 2.2. Iterate over qhour from serie.lastProcessedUTCQhour to processUntil and process each qhour
      let qhour = serie.lastProcessedUTCQhour
      while(qhour <= processUntilQhour) {
        const qhourEnd = DataSeriesQhourly.intervalShift(qhour, 1, serie.timezone)

        await mgr.transaction(async (trn) => {
          // 2.2.1. Select all relevant installations
          const st = serie.siteCharacteristic.site
          const installs = await getInstallationsInRange(st, qhour, qhourEnd, trn)
          
          // 2.2.2. Process logs in the qhour
          // TODO - other processing methods than DIFFERENCE
          let value = 0

          // 2.2.2.1. Iterate over all relevant installations and add diferences to the overal value
          for (const inst of installs) {
            const logs = await getLogsInRange(inst, serie.siteCharacteristic, qhour, qhourEnd, trn)
            
              // Not enough readouts to calculate consumption
              if ((!logs.out && logs.in.length < 2) || (logs.out && logs.in.length < 1)) {
                continue
              }

              // Calculate consumption and add it to overal value
              const firstLog = logs.out || logs.in[0]
              const lastLog = logs.in[logs.in.length - 1]
              value += lastLog.value - firstLog.value
          }

          // 2.2.3. If overal value is not 0 save it
          if (value != 0) {
            const qhourEnd = DataSeriesQhourly.getIntervalEnd(qhour, serie.timezone)
            // If there is time shift (dayligt saving time)
            const input = await DataSeriesQhourly.entryForInterval(serie, qhour, trn)
            input.value += value
            trn.getRepository(DataSeriesQhourly).save(input)
          }

          // 2.2.4. Agregate values
          await agregateValue(DataSeriesHourly, serie, qhour, trn)
          await agregateValue(DataSeriesDaily, serie, qhour, trn)
          await agregateValue(DataSeriesMonthly, serie, qhour, trn)

          // 2.2.5. push lastProcessedUTCQhour forward          
          serie.lastProcessedUTCQhour = qhour
          trn.getRepository(DataSeries).save(serie)

          // 2.2.6. move to the next qhour
          qhour = qhourEnd
        })
      }

      serie.updatesProcessedUntilUTCTime = now
      mgr.getRepository(DataSeries).save(serie)
    }

    runningPromise = null
  }

  async function findResetUTCTime(serie: DataSeries, trn?: EntityManager): Promise<Date | null> {
    const mgr = trn || dataSource.manager

    const log = await mgr.getRepository(SiteLog).createQueryBuilder('sl')
      .where('sl.characteristic = :char', { char: serie.siteCharacteristic})
      .where('sl.updatedUTCTime > :date AND sl.logUTCTime < :endDate', { 
        date: serie.updatesProcessedUntilUTCTime,
        endDate: serie.lastProcessedUTCQhour
      })
      .orderBy('sl.logUTCTime', 'ASC')
      .limit(1)
      .getOne()
    if (!log) {
      return null
    }
    return log.updatedUTCTime
  }

  async function getInstallationsInRange(site: Site, qhour: Date, qhourEnd: Date, trn?: EntityManager): Promise<SiteMeterInstallation[]> {
    const mgr = trn || dataSource.manager

    return await mgr.getRepository(SiteMeterInstallation)
    .createQueryBuilder('smi')
    .leftJoinAndSelect('smi.meter', 'm')
    .leftJoinAndSelect('m.type', 'mt')
    .leftJoinAndSelect('smi.map', 'map')
    .leftJoinAndSelect('map.siteCharacteristic', 'sc')
    .leftJoinAndSelect('map.meterTypeUnit', 'mtu')
    .where('smi.site = :site', { site })
    .andWhere('smi.installationUTCTime IS NULL OR smi.installationUTCTime <= :qhour', { qhour })
    .andWhere('smi.removalUTCTime IS NULL OR smi.removalUTCTime >= :qhourEnd', { qhourEnd })
    .getMany()
  }

  type SiteLogsInRange = {
    in: SiteLog[],
    out?: SiteLog
  }
  async function getLogsInRange(inst: SiteMeterInstallation, char: SiteCharacteristic, qhour: Date, qhourEnd: Date, trn?: EntityManager): Promise<SiteLogsInRange> {
    const mgr = trn || dataSource.manager

    return {
      in: await mgr.getRepository(SiteLog)
        .createQueryBuilder('sl')
        .where('sl.siteMeterInstallation = :inst', { inst })
        .where('sl.characteristic = :char', { char })
        .where('sl.logUTCTime >= :qhour AND sl.logUTCTime < :qhourEnd', { qhour, qhourEnd })
        .getMany(),
      out: await trn.getRepository(SiteLog)
        .createQueryBuilder('sl')
        .where('sl.siteMeterInstallation = :inst', { inst })
        .where('sl.characteristic = :char', { char })
        .where('sl.logUTCTime < :qhour', { qhour } )
        .orderBy('sl.logUTCTime', 'DESC')
        .limit(1)
        .getOne()
    }
  }

  async function pruneDataEntries<R extends DataSeriesEntryStatic>(EntryClass: R, serie: DataSeries, trn?: EntityManager): Promise<void> {
    const mgr = trn || dataSource.manager

    await mgr.getRepository(EntryClass).createQueryBuilder()
    .delete()
    .from(EntryClass)
    .where('dataSeries = :dsId AND UTCTime >= :date', {
      dsId: serie.id,
      date: EntryClass.getIntervalBegin(serie.lastProcessedUTCQhour, serie.timezone)
    })
    .execute()
  }

  async function agregateValue<R extends DataSeriesEntryStatic>(EntryClass: R, serie: DataSeries, qhour: Date, trn?: EntityManager): Promise<void> {
    const mgr = trn || dataSource.manager

    // Agregate only if the end of qhour matches the end of agregated interval
    if (!EntryClass.isEndOfInterval(DataSeriesQhourly.intervalShift(qhour, 1))) {
      return
    }

    const interval = EntryClass.normalizeInterval(EntryClass.getInterval(qhour, serie.timezone))

    const list = await mgr.getRepository(DataSeriesQhourly).createQueryBuilder('dsq')
    .where('dsq.dataSeries = :serie AND dsq.UTCTime >= :beg AND dsq.UTCTime < :end', {
      serie: serie,
      beg: interval.begin,
      end: interval.end
    })
    .getMany()

    const entry = await EntryClass.entryForInterval(serie, interval.begin, mgr)
    entry.value += list.reduce((acc, item) => {
      return acc + item.value
    }, 0)
    
    mgr.getRepository(EntryClass).save(entry)
  }

  function shouldRunNow(): boolean {
    const now = new Date()
    const minutes = now.getUTCMinutes()
    return !((minutes - processMinuteInQHour) % 15)
  }

  return {
    enable,
    disable
  }
}