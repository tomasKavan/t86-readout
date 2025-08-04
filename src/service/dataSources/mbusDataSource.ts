import { DataSource, IsNull, Not } from "typeorm"
import { MbusReadout, ReadSlaveQuery, ReadSlaveResponse } from "../readout/mbus/MbusReadout"
import { Metric, Readout } from "../models"
import { Type as ReadoutType, Source as ReadoutSource } from "../models/Readout"
import { logger } from "../logger"
import Big from "big.js"

export type MbusDataSourceConfigOptions = {
  host: string,
  port: number,
  timeout: number
}

export default function configureMbusDataSource(config: MbusDataSourceConfigOptions) {
  logger.debug(`[MBusReadout] Configuring (${JSON.stringify(config)})`)
  const mbus = new MbusReadout(config)

  async function readout(db: DataSource) {
    logger.info(`[MBusReadout] Executing M-Buse readout sequence`)

    const mrep = db.manager.getRepository(Metric)
    const metrics = await mrep.find({
      where:{ 
        mbusValueRecordId: Not(IsNull()),
        autoReadoutEnabled: true,
        measPoint: {
          mbusAddr: Not(IsNull())
        }
      },
      relations: {
        measPoint: true
      }
    })

    logger.info(`[MBusReadout] -- Got ${metrics.length} metrics`)
    logger.debug(JSON.stringify(metrics))

    const list: ReadSlaveQuery[] = []

    for (const m of metrics) {
      let rsq = list.find(item => item.primaryAddress === m.measPoint.mbusAddr)
      if (!rsq) {
        if (typeof m.measPoint.mbusAddr !== 'number') {
          // We know there is number - see where clause of find method above. But to be sure:
          logger.error(`[MBusReadout] -- Trying to read MeasPoint (ID:${m.measPoint.id}) without M.Bus address.`)
          continue
        }
        rsq = {
          primaryAddress: m.measPoint.mbusAddr,
          serial: m.measPoint.mbusSerial || '',
          records: []
        }
        list.push(rsq)
      }
      // We know there is number - see where clause of find method above. But to be sure:
      if (m.mbusValueRecordId === undefined) {
        logger.error(`[MBusReadout] -- Trying to read Metric (ID:${m.id}) of MeasPoint (ID: ${m.measPoint.id}) without M.Bus record ID.`)
        continue
      }
      rsq.records.push({
        recordId: m.mbusValueRecordId,
        decimalShift: m.mbusDecimalShift
      })
    }

    logger.info(`[MBusReadout] -- Reading ${list.length} M-Bus slaves...`)
    let res: ReadSlaveResponse[] = []
    try {
      await mbus.connect()
      res = await mbus.readInputs(list)
      await mbus.close()
    } catch (e) {
      logger.error(`[MBusReadout] -- M-Bus slaves read Error (${e})`)
      return  
    }
    logger.info(`[MBusReadout] -- M-Bus slaves read finished...`)
    logger.debug(JSON.stringify(res))

    const readoutList: Readout[] = []

    for (const slave of res) {
      for (const rec of slave.data) {
        const metric = metrics.find(m => {
          return m.measPoint.mbusAddr === slave.query.primaryAddress 
            && m.mbusValueRecordId === rec.recordId
        })
        if (!metric) {
          // TODO: Log error and skip
          continue
        }
        const readout = new Readout()
        readout.metric = metric
        readout.source = ReadoutSource.MBUS
        readout.meterUTCTimestamp = rec.timestamp ?? new Date()

        if (slave.error || rec.error) {
          readout.type = ReadoutType.ERROR
          if (slave.error) {
            readout.errCode = slave.error.code
            readout.errDetail = slave.error.message
          } else if (rec.error) {
            readout.errCode = rec.error.code
            readout.errDetail = rec.error.message
          }
          // TODO: process error into Readout entry
        } else {
          readout.type = ReadoutType.READOUT
          readout.value = rec.value ?? new Big(0)
        }
        
        readoutList.push(readout)
      }
    }

    const rrep = db.manager.getRepository(Readout)
    await rrep.save(readoutList)
  }

  return {
    readout
  }

}