import { Brackets, DataSource } from "typeorm";
import { ConsumptionPlace, Meter, MeterInstallation, MeterReadoutLog, MeterType } from "../models";
import { MbusReadout, ReadoutOutput } from "./MbusReadout";
import { ReadoutLogEntryStatus } from "../models/MeterReadoutLog";

function installationOnPrimaryAddress(places: ConsumptionPlace[], primary: number): MeterInstallation | null {
  const cp = places.find(cp => cp.mbusPrimary === primary)
  if (!cp) {
    return null
  }
  return cp.installedMeters[0]
}

let isReadingOut = false

export async function readout(ds: DataSource): Promise<ReadoutOutput[]> {
  if (isReadingOut) {
    throw new Error(`[readout.ts]: Requested readout during another readout session. Invalid operation.`)
  }

  try {
    const now = new Date()
    const cplaces = await ds.manager
      .createQueryBuilder(ConsumptionPlace, 'cp')
      .innerJoinAndSelect('cp.installedMeters', 'mi')
      .innerJoinAndSelect('mi.meter', 'm')
      .innerJoinAndSelect('m.type', 'mt')
      .where(
        new Brackets(qb => {
          qb.where('mi.installation <= :readoutTime', {readoutTime: now})
          .orWhere('mi.installation IS NULL')
        })
      )
      .andWhere(new Brackets(qb => {
        qb.where('mi.removal >= :readoutTime', {readoutTime: now})
        .orWhere('mi.removal IS NULL')
      }))
      .getMany()

    console.log(`[readout.ts] Got ${cplaces.length} Consumption Places with Meters installed`)

    const toReadout = cplaces.map(cp => {
      return {
        primaryAddress: cp.mbusPrimary,
        serial: cp.installedMeters[0].meter.mbusSecondary,
        recordId: cp.installedMeters[0].meter.type.valueRecordId,
        rescaleOrder: cp.installedMeters[0].meter.type.rescaleOrder
      }
    })

    const mbus = new MbusReadout({
      host: '10.30.2.100',
      port: 10001,
      timeout: 1000,
      autoConnect: true
    })

    await mbus.connect()

    const list = await mbus.readInputs(toReadout, async (out) => {
      const newNow = new Date()
      console.log(`[readout.ts] CP with address ${out.input.primaryAddress} @ ${newNow} readed: <value;error> ${out.data?.value};${out.error?.toString().substring(0,30)}...`)
      try {
        const logRecord = new MeterReadoutLog()
        logRecord.time = now
        logRecord.installation = installationOnPrimaryAddress(cplaces, out.input.primaryAddress)
        if (out.error) {
          logRecord.status = ReadoutLogEntryStatus.ERROR
          logRecord.error = out.error.toString()
        } else {
          logRecord.status = ReadoutLogEntryStatus.OK
          logRecord.meterTimestamp = out.data.timestamp
          logRecord.value = out.data.value
        }
        console.log(`[readout.ts] CP with address ${out.input.primaryAddress} saving to DB`)
        await ds.manager.save(logRecord)
        console.log(`[readout.ts] CP with address ${out.input.primaryAddress} saved to DB`)
      } catch (e) {
        console.log(`[readout.ts] CP with address ${out.input.primaryAddress}: Unable to process readout: ${e}`)
      }
    }, true)

    await mbus.close()
    isReadingOut = false
    return list

  } catch (e) {
    isReadingOut = false
    throw e
  }
}