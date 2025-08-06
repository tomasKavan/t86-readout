import { Arg, Ctx, Int, Query, Resolver } from "type-graphql"
import Big from "big.js"

import { ApiContext } from "../graphqlServer"
import { MBusSlave } from "../models/MBusSlave"
import { MBusRecord } from "../models/MBusRecord"
import { logger } from "../logger"

/**
 * Resolver to Query raw M-Bus
 */
@Resolver(() => MBusSlave)
export class MBusQueryResolver {
  /**
   * Query a raw response from MBus Slave
   * 
   * @param primaryAddr MBus Slave primary address
   * @param ctx 
   * @returns Readings in an instance of MBusSlave with all records present
   */
  @Query(() => MBusSlave)
  async slaves(
    @Arg('primaryAddr', () => Int) primaryAddr: number,
    @Ctx() ctx: ApiContext
  ): Promise<MBusSlave> {
    await ctx.mbus.connect()
    const data = await ctx.mbus.readAddress(primaryAddr)
    await ctx.mbus.close()

    if (!data.SlaveInformation) {
      throw new Error(`Wrong response from MBus master (missing SlaveInformation key): ${JSON.stringify(data)}`)
    }

    const dsi = data.SlaveInformation
    const slv = new MBusSlave()
    slv.primaryAddress = primaryAddr
    slv.manufacturer = dsi.Manufacturer || null
    slv.type = dsi.ProductName || null
    slv.medium = dsi.Medium || null
    slv.status = dsi.Status || null
    slv.serial = data.Id || null
    
    const drs = data.DataRecord
    if (drs instanceof Array) {
      for (const r of drs) {
        const rec = new MBusRecord()
        rec.id = r.id

        rec.function = r.Function || null
        rec.storageNumber = r.StorageNumber || null
        rec.tariff = r.Tariff || null
        rec.device = r.Device || null
        rec.unit = r.Unit || null
        rec.value = typeof r.Value === 'number' ? new Big(r.Value) : null
        rec.timestamp = r.Timestamp ? new Date(r.Timestamp) : null

        slv.records.push(rec)
      }
    }

    logger.info(`[MBusQueryResolver] Queried adddress ${primaryAddr}`)
    logger.debug(`[MBusQueryResolver] -- data returned: ${slv}`)

    return slv
  }
}