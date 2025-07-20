import { DataSource, IsNull, Not } from "typeorm"
import { MbusReadout, ReadSlaveQuery } from "./MbusReadout"
import { Metric, Readout } from "./models"
import { Type as ReadoutType, Source as ReadoutSource } from "./models/Readout"

export type MbusDataSourceConfigOptions = {
  host: string,
  port: number,
  timeout: number
}

export default function configureMbusDataSource(config: MbusDataSourceConfigOptions) {
  const mbus = new MbusReadout(config)

  async function readout(db: DataSource) {
    const mrep = db.manager.getRepository(Metric)
    const metrics = await mrep.find({
      where:{ 
        mbusValueRecordId: Not(IsNull()),
        autoReadoutEnabled: true
      },
      relations: {
        measPoint: true
      }
    })

    const list: ReadSlaveQuery[] = []

    for (const m of metrics) {
      let rsq = list.find(item => item.primaryAddress === m.measPoint.mbusAddr)
      if (!rsq) {
        rsq = {
          primaryAddress: m.measPoint.mbusAddr,
          serial: m.measPoint.mbusSerial,
          records: []
        }
        list.push(rsq)
      }
      rsq.records.push({
        recordId: m.mbusValueRecordId,
        decimalShift: m.mbusDecimalShift
      })
    }

    const res = await mbus.readInputs(list)

    const readoutList: Readout[] = []

    for (const slave of res) {
      for (const rec of slave.data) {
        const metric = metrics.find(m => {
          return m.measPoint.mbusAddr === slave.query.primaryAddress 
            && m.mbusValueRecordId === rec.recordId
        })
        if (!metric) {
          // TODO: Log error and skip
        }
        const readout = new Readout()
        readout.metric = metric
        readout.source = ReadoutSource.MBUS
        readout.meterUTCTimestamp = rec.timestamp

        if (slave.error || rec.error) {
          readout.type = ReadoutType.ERROR
          // TODO: process error into Readout entry
        } else {
          readout.type = ReadoutType.READOUT
          readout.value = rec.value
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