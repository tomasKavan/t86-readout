import { DataSource } from "typeorm";
import { ReadMethod, ReadMethodMBus, SiteMeterInstallation, SiteMeterInstallationMBus } from "./models"
import { MbusReadout, ReadSlaveQuery } from "./MbusReadout"
import { CronScheduler, CronSchedulerTask } from "./CronScheduler"
import { ReadMethodScheduled } from "./models/ReadMethodScheduled"
import { EntryStatus, SiteLog } from "./models/SiteLog"

export type ReadoutSchedulerOptions = {
  refreshScheduleEachMs: number,
  onStart: boolean
}

export default function ReadoutScheduler(dataSource: DataSource, config: ReadoutSchedulerOptions) {
  const sch = new CronScheduler({
    scheduleRefreshIntervalMs: config.refreshScheduleEachMs,
    scheduleRefresh: async () => {
      const srmList = await dataSource.manager.find(ReadMethodScheduled)
      return srmList.map(srm => {
        return {
          id: srm.id,
          cronUTCExpression: srm.cronUTCExpression,
          params: srm
        }
      })
    },
    task: async (task: CronSchedulerTask<ReadMethodScheduled>) => {
      const now = new Date()
      const method = await dataSource.manager.findOneBy(ReadMethod, { id: task.params.id })
      if (!method) {
        throw new Error(`[Readout Scheduler] Scheduled readout method ${task.id} is not in DB`)
      }
      if (!method.enabled) {
        console.log(`[Readout Scheduler]: Skipping readoud method ${task.id}. It's DISABLED in DB`)
      }

      // List all meters
      const installations = await dataSource.manager.createQueryBuilder(SiteMeterInstallation, 'smi')
      .leftJoinAndSelect('e.meter', 'meter')
      .leftJoinAndSelect('e.map', 'map')
      .leftJoinAndSelect('map.siteCharacteristic', 'sc')
      .leftJoinAndSelect('map.meterTypeUnit', 'mtu')
      .where('e.readMethod = :rm', { rm: task.params.id })
      .andWhere('(e.installationUTCTime IS NULL OR e.installationUTCTime <= :now1', { now1: now})
      .andWhere('(e.removalUTCTime IS NULL OR e.removalUTCTime >= :now2')
      .getMany()
      console.log(`[Readout Scheduler]: Gathered ${installations.length} for readout method ${task.id}`)

      // Process MBus readout
      if (method instanceof ReadMethodMBus) {
        const mbMethod = method as ReadMethodMBus
        const mbus = new MbusReadout({
          host: mbMethod.host,
          port: mbMethod.port,
          timeout: mbMethod.timeout,
          autoConnect: mbMethod.autoConnect
        })
        await mbus.connect()

        const queries: ReadSlaveQuery[] = []

        const mbi = installations as SiteMeterInstallationMBus[]
        for (const inst of mbi) {
          // const mbInst = inst as SiteMeterInstallationMBus
          const rsq = findOrNewSlave(queries, inst.mbusPrimary, inst.meter.mbusSecondary)

          for (const map of inst.map) {
            rsq.records.push({
              recordId: map.meterTypeUnit.valueRecordId,
              rescaleOrder: map.meterTypeUnit.rescaleOrder
            })
          }
        }

        const results = await mbus.readInputs(queries)
        const now = new Date()

        for (const result of results) {
          if (result.error) {
            console.log(`[Readout Scheduler] MBus slave (${result.query.primaryAddress}) read error: ${result.error}`)
            continue
            // TODO: report MBus read error somewhere ...
          }

          const inst = mbi.find(i => i.mbusPrimary === result.query.primaryAddress)

          for (const record of result.data) {
            const map = inst.map.find(m => m.meterTypeUnit.valueRecordId === record.recordId)
            const logRec = new SiteLog()
            logRec.characteristic = map.siteCharacteristic
            logRec.siteMeterInstallation = inst
            logRec.valid = true
            logRec.logUTCTime = now,
            logRec.status = record.error ? EntryStatus.ERROR : EntryStatus.OK
            if (logRec.status === EntryStatus.OK) {
              logRec.meterUTCTimestamp = record.timestamp
              logRec.value = record.value
            } 
            logRec.error = record.error ? record.error.toString() : null
            
            await dataSource.manager.save(logRec)
            console.log(`[Readout Scheduler] Mbus slave (${result.query.primaryAddress}), recordId (${record.recordId}) saved to Log DB`)
          }
        }
        await mbus.close()
        return
      }

      throw new Error(`[Readout Scheduler] Unknown type of readout method ${task.id}`)
    }
  })

  return sch
}

function findOrNewSlave(list: ReadSlaveQuery[], primaryAddress: number, mbusSecondary: number): ReadSlaveQuery {
  const rec = list.find(i => i.primaryAddress === primaryAddress) 
  if (rec) {
    return rec
  }
  const rsq: ReadSlaveQuery = {
    primaryAddress: primaryAddress,
    serial: mbusSecondary,
    records: []
  }
  list.push(rsq)
  return rsq
}
