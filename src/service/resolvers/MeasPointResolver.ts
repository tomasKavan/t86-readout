import { Arg, Ctx, ID, Mutation, Query, Resolver } from "type-graphql"
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from "graphql"

import { Correction, MeasPoint, Metric, Readout, ServiceEvent } from "../models"
import { ApiContext } from "../graphqlServer"
import { AddMeasPoint, ChangeMeter, ChangeMeterCorrection, UpdateMeasPoint } from "../types/MeasPointTypes"
import { mapKeysShallow, updateDefined } from "../utils/objectProc"
import { boolean } from "yargs"
import { Func } from "../models/MetricEnums"
import Big from "big.js"
import { MoreThanOrEqual } from "typeorm"
import { Type } from "../models/ServiceEvent"
import { logger } from "../logger"

/**
 * Resolver for Measurement Points
 */
@Resolver(() => MeasPoint)
export class MeasPointResolver {

  /**
   * Returns list of all measurement points 
   *
   * All metrics an service events are available. Won't resolve Metric's readouts or corrections.
   * Filtering or pagination isnt possible. There is only limited amount of points expected.
   * 
   * @param ctx GraphQL Server context (passed by Apollo server)
   * @returns List of all measurement points.
   */
  @Query(() => [MeasPoint])
  async measPoints(@Ctx() ctx: ApiContext): Promise<MeasPoint[]> {
    const mps = await ctx.ds.getRepository(MeasPoint).find({
      relations: ['metrics', 'serviceEvents']
    })
    
    return mps
  }

  /**
   * Returns one measurement point found by it's id
   * 
   * All metrics an service events are available. Won't resolve Metric's readouts or corrections.
   * 
   * @param id - ID of requested measurement point
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns Instance of measurement point
   */
  @Query(() => MeasPoint)
  async measPoint (
    @Arg('id') id: string, 
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    const mp = await ctx.ds.getRepository(MeasPoint).findOne({ 
      where : { id },
      relations: ['metrics', 'serviceEvents']
    })
    
    if (!mp) {
      throw new GraphQLError(`MeasPoint with ID ${id} not found`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
      })
    }

    return mp
  }

  /**
   * Add new measurement point 
   * 
   * It also creates all metrics passed in the data.metrics array.
   * 
   * @param data - Measurement Point and it's Matrics data. See {@link AddMeasPoint} for details.
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns Newly create instance of Measurement Point 
   */
  @Mutation(() => MeasPoint)
  async addMeasPoint(
    @Arg('data') data: AddMeasPoint,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    return await ctx.ds.transaction(async trn => {
      const mprep = trn.getRepository(MeasPoint)  

      if (await mprep.findOneBy({ id: data.id })) {
        throw new GraphQLError(`MeasPoint with thi id [${data.id}] already exists`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      const mp = mprep.create(data)

      logger.info(`[MeasPointResolver] ID ${mp.id} Added with ${mp.metrics.length} metrics.`)
      logger.debug(`[MeasPointResolver] -- added data: ${data}`)

      await mprep.save(mp)
      return mp
    })
  }

  /**
   * Update attributes of existing measurement point
   * 
   * Only some attributes can be updated by this mutation. Measurements related data are 
   * mutated by {@link changeMeter} mutation. Measurement point's Metrics are changed
   * by mutations in {@link MetricResolver}.
   * 
   * @param id - ID of updated Measurement Point
   * @param data - Changed Measurement Point attributes. See {@link UpdateMeasPoint} for details.
   * @param ctx - GraphQL Server context (passed by Apollo server) 
   * @returns Updated instance of Measurement Point with Metrics and Service Events
   */
  @Mutation(() => MeasPoint)
  async updateMeasPoint(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: UpdateMeasPoint,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    return await ctx.ds.transaction(async trn => {
      const mprep = trn.getRepository(MeasPoint)  

      try { 
        const mp = await mprep.findOneByOrFail({ id: id })
        updateDefined(mp, data)
        await mprep.save(mp)

        logger.info(`[MeasPointResolver] ID ${id} Updated`)
        logger.debug(`[MeasPointResolver] -- changed data: ${data}`)

        return mp
      } catch (e) {
        throw new GraphQLError(`MeasPoint with the id [${id}] not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }
    })
  }

  /**
   * Change of metering device on Measurement Point
   * 
   * Mutation must be called after a measuring device is replaced on Measurement Ponint.
   * Besides all new metering device params it's also important to enter exact time when
   * the metering device change occured. Change time is significant:
   * - All readouts with meterUTCTimestamp younger than change time are deleted.
   * - It's invalid to call the changeMeter mutation with time of change older than the youngest
   *   change.
   * 
   * Meter change is stored as Service Event on Measurement Point. To keep history the Service 
   * Event holds the old measuring device attributes.
   * 
   * Meter Change Mutation fails if there are younger readouts than the change time and param
   * `force` is not set.
   * 
   * ### Notes about Corrections
   * It's crucial to enter all corrections (attribute `corrections` of `data` object) to 
   * Measurement Point's Metrics data series. Corrections serves 2 purposes:
   * - updates Meteric related values of measuring device (attributes) and
   * - corrects data collected in readouts (value).
   * 
   * Attributes are (`oldMeterHasPhysicalDisplay`, `oldMeterMbusValueRecordId` and
   * `oldMeterMbusDecimalShift`). If a correction for a metric is missing or an attribute is
   * ommited, it's assumed the attribute hasn't changed.
   * 
   * Correction value is computed or can be inputed manually. Computation algorithm is based 
   * on Metric's Function and uses `oldMeterEndValue` and `newMeterStartValue` attributes.
   * 
   * **Inst** - correction is not automatically computed. Value is set to 0.
   * **Sum** - correction is the difference between new and old metering device value in 
   * the moment of change. Eg.:
   * - old meter value is 10520
   * - new meter value is 00050
   * - correction is -10470
   * Corrections are used to properly compute readings in Series. See {@link SerieResolver} for
   * more details.
   * 
   * If correction for a metric is missing and Metric's Function is `Sum`, meter change is invalid.
   * But if it's there and one of `oldMeterEndValue` or `newMeterStartValue` is null, the 
   * correction is set to 0 unless explicitly set in `value`.
   * 
   * @param id - ID of Measurement Point with metering device being changed 
   * @param data 
   * @param force - Proceed even if younger readouts are present
   * @param ctx - GraphQL Server context (passed by Apollo server) 
   */
  @Mutation(() => MeasPoint)
  async changeMeter(
    @Arg('id', () => ID, { description: 'MeasPoint ID'}) id: string,
    @Arg('data') data: ChangeMeter,
    @Arg('force', { defaultValue: false }) force: boolean,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    return await ctx.ds.transaction(async trn => {
      const mprep = trn.getRepository(MeasPoint)
      const serep = trn.getRepository(ServiceEvent)

      const mp = await mprep.findOne({ 
        where : { id },
        relations: ['metrics', 'serviceEvents']
      })
      
      if (!mp) {
        throw new GraphQLError(`MeasPoint with ID ${id} not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      // Check if occuredUTCTime is younger than last ServiceEvent
      for (const se of mp.serviceEvents) {
        if (Math.round(se.occuredUTCTime.getTime()) / 1000 >= Math.round(data.occuredUTCTime.getTime() / 1000)) {
          throw new GraphQLError(`There is younger Service Event (ID: ${se.id}) than ${data.occuredUTCTime}. Meter change request is thus invalid.`, {
            extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
          })
        }
      }

      // Load readouts which are younger than change time
      const rots = await trn.getRepository(Readout).find({
        where: { meterUTCTimestamp: MoreThanOrEqual(data.occuredUTCTime)}
      })
      
      // If there are some younger readouts, force argument must be set
      if (rots.length && !force) {
        throw new GraphQLError(`There are younger Readouts (count: ${rots.length}) than ${data.occuredUTCTime} and force atribut is not set. Meter change request is thus invalid.`, {
          extensions: { code: 'HAS_SOME_READOUTS' }
        })
      }

      // Iterate over metric and for each metric find correction in the input or create an empty one
      const corrs: Partial<Correction>[] = []
      for (const m of mp.metrics) {
        let dc = data.corrections.find(c => c.metricId === m.id)
        if (!dc) {
          dc = new ChangeMeterCorrection()
          dc.metricId = m.id
          data.corrections.push(dc)
        }

        // Create TypeORM Correction entity
        const corr: Partial<Correction> = {}
        corr.metric = { id: dc.metricId } as Metric
        corrs.push(corr)
        
        // Maps some keys from Input.correction to Correction
        mapKeysShallow(['value', 'oldMeterEndValue', 'newMeterStartValue'], corr, dc)
        
        // Map some keys from Metric to Correction (stroe current values as old)
        mapKeysShallow([
          'hasPhysicalDisplay:oldMeterHasPhysicalDisplay', 
          'mbusValueRecordId:oldMeterMbusValueRecordId', 
          'mbusDecimalShift:oldMeterMbusDecimalShift'
        ], corr, m)

        // Maps some keys from Input.correction to Metric
        // but keeping Metric as defaults if an attribut is not present on input
        mapKeysShallow(['hasPhysicalDisplay', 'mbusValueRecordId', 'mbusDecimalShift'], m, dc, m)

        // Compute correction value (if needed, otherwise set 0)
        corr.value = new Big(0)
        if (m.func = Func.SUM) {
          if ((corr.newMeterStartValue instanceof Big) && (corr.oldMeterEndValue instanceof Big)) {
            corr.value = corr.oldMeterEndValue.minus(corr.newMeterStartValue)
          }
        }
      }

      // Create Service Event object and fill it
      const se: Partial<ServiceEvent> = {}
      se.measPoint = { id: mp.id } as MeasPoint
      se.type = Type.METER_REPLACEMENT
      se.corrections = corrs as Correction[]

      // Map some keys from Input to Service Event
      mapKeysShallow(['occuredUTCTime', 'comments'], se, data)
      
      // Map some keys from MeasPoint to Service Event (store current values as old)
      mapKeysShallow([
        'mbusAddr:oldMbusAddr', 
        'mbusSerial:oldMbusSerial', 
        'meterManufacturer:oldMeterManufacturer', 
        'meterType:oldMeterType' 
      ], se, mp)

      // Map some keys from Input to MeasPoint 
      // keep MesPoint as defaults if attribute not present
      const ump = mprep.create()
      mapKeysShallow(['id', 'mbusAddr', 'mbusSerial', 'meterManufacturer', 'meterType'], ump, data, mp)

      // All ready - Let's save it
      await serep.save(se)
      await mprep.save(ump)

      let rcount = 0
      if (rots.length) {
        const rep = trn.getRepository(Readout)
        const res = await rep.softDelete({ 
          meterUTCTimestamp: MoreThanOrEqual(data.occuredUTCTime)
        })
        rcount = res.affected || 0
      }

      const respmp = await mprep.findOne({ 
        where : { id },
        relations: [
          'metrics', 
          'serviceEvents', 
          'serviceEvents.corrections', 
          'serviceEvents.corrections.metric'
        ]
      })
      
      logger.info(`[MeasPointResolver] ID ${se.measPoint.id} - Added Service Event - Meter Change`)
      logger.debug(`[MeasPointResolver] -- added ${se.corrections.length} corrections`)
      logger.debug(`[MeasPointResolver] -- soft remove of readouts younger than ${se.occuredUTCTime}, count ${rcount}`)

      return respmp as MeasPoint
    })
    
  }

  /**
   * Revert of metering device change on Measurement Point
   * 
   * Mutation is used to rever the youngest occurence of metering device change on Measurement
   * Point. It returns Measurement Point attributes related to measuring device (`mbusAddr`,
   * `busSerial`, `meterManufacturer` and `meterType`) to previous state and removes:
   * - Service Event,
   * - It's corrections,
   * - All readouts younger than the deleted service event occurence time.
   * 
   * Revert Change of Meter Mutation fails if there are younger readouts than the original Service
   * Event change time and param `force` is not set.
   * 
   * Revert Change of Meter Mutation fails if Service Event identified by `serviceEventId` attribute
   * not belongs to Measurement Point identified by `id` attribute.
   * 
   * @param id - ID of Measurement Point with metering device being changed 
   * @param serviceEventId - ID of Service Event which should be reverted 
   * @param force - Proceed even if younger readouts are present
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns Updated instance of Measurement Point with Metrics and Service Events
   */
  @Mutation(() => MeasPoint)
  async revertMeterChange(
    @Arg('measPointId', () => ID) id: string,
    @Arg('serviceEventId', () => ID) serviceEventId: number | string,
    @Arg('force', { defaultValue: false }) force: boolean,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    return await ctx.ds.transaction(async trn => {
      const mp = await trn.getRepository(MeasPoint).findOne({
        where: { id: id },
        relations: ['serviceEvents', 'metrics', 'serviceEvents.corrections']
      })

      if (!mp) {
        throw new GraphQLError(`MeasPoint with ID ${id} not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      const se = mp.serviceEvents.find(mpse => String(mpse.id) === String(serviceEventId))
      if (!se) {
        throw new GraphQLError(`ServiceEvent with ID ${serviceEventId} on MeasPoint (ID ${id}) not found.`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      if (mp.serviceEvents.find(mpse => mpse.occuredUTCTime.getTime() > se.occuredUTCTime.getTime())) {
        throw new GraphQLError(`ServiceEvent with ID ${serviceEventId} on MeasPoint (ID ${id}) is not the younest one.`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      const rots = await trn.getRepository(Readout).findBy({
        meterUTCTimestamp: MoreThanOrEqual(se.occuredUTCTime)
      })
      if (rots.length && !force) {
        throw new GraphQLError(`MeasPoint (ID${id}) has younger readouts than ${se.occuredUTCTime}, but force attribute is not set.`, {
          extensions: { code: 'HAS_SOME_READOUTS' }
        })
      }

      // Soft remove doesn't cascade we need to remove all respective children
      await trn.getRepository(ServiceEvent).softRemove(se)
      await trn.getRepository(Correction).softRemove(se.corrections)
      const res = await trn.getRepository(Readout).softDelete({
        meterUTCTimestamp: MoreThanOrEqual(se.occuredUTCTime)
      })

      logger.info(`[MeasPointResolver] ID ${se.measPoint.id} - Reverted Service Event ID ${se.id}.`)
      logger.debug(`[MeasPointResolver] -- soft remove of ${se.corrections.length} corrections`)
      logger.debug(`[MeasPointResolver] -- soft remove of readouts younger than ${se.occuredUTCTime}, count ${res.affected}`)

      // Remove deleted Service Event from MeasPoint
      mp.serviceEvents.splice(mp.serviceEvents.indexOf(se), 1)
      return mp
    })
  }

  /**
   * 
   * Enable auto readout of Measurement Point
   * 
   * @param id - ID of Measurement Point which autoReadout status should be changed 
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns Instance of Measurement Point with autoReadout attribute adjusted 
   */
  @Mutation(() => MeasPoint)
  async enableAutoReadout(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    const mp = await ctx.ds.getRepository(MeasPoint).findOne({ 
      where : { id },
      relations: ['metrics', 'serviceEvents']
    })
    
    if (!mp) {
      throw new GraphQLError(`MeasPoint with ID ${id} not found`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
      })
    }

    mp.autoReadoutEnabled = true
    await ctx.ds.getRepository(MeasPoint).save(mp)

    return mp
  }

  /**
   * 
   * Disable auto readout of Measurement Point
   * 
   * @param id - ID of Measurement Point which autoReadout status should be changed 
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns Instance of Measurement Point with autoReadout attribute adjusted 
   */
  @Mutation(() => MeasPoint)
  async disableAutoReadout(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    const mp = await ctx.ds.getRepository(MeasPoint).findOne({ 
      where : { id },
      relations: ['metrics', 'serviceEvents']
    })
    
    if (!mp) {
      throw new GraphQLError(`MeasPoint with ID ${id} not found`, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
      })
    }

    mp.autoReadoutEnabled = false
    await ctx.ds.getRepository(MeasPoint).save(mp)

    return mp
  }

  /**
   * 
   * Delete of Mesurement Point
   * 
   * Removes Mesurement Point and it's all related entities:
   * - Service Events
   * - Corrections
   * - Metrics
   * - Readouts
   * 
   * @param id - ID of Measurement Point which should be deleted 
   * @param force - Proceed even if some readouts are present on any of Measurement Point's Metrics 
   * @param ctx - GraphQL Server context (passed by Apollo server) 
   * @returns true if Measurement Point was sucessfuly deleted
   */
  @Mutation(() => Boolean)
  async deleteMeasPoint(
    @Arg('id', () => ID) id: string,
    @Arg('force', { nullable: true }) force: boolean,
    @Ctx() ctx: ApiContext
  ): Promise<boolean> {
    return await ctx.ds.transaction(async trn => {
      const mp = await trn.getRepository(MeasPoint).findOne({
        where: { id: id },
        relations: ['serviceEvents', 'metrics', 'serviceEvents.corrections', 'metrics.readouts']
      })

      if (!mp) {
        throw new GraphQLError(`MeasPoint with ID ${id} not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      const agRots = mp.metrics.reduce((a, i) => {
        return [...a, ...i.readouts]
      }, [] as Readout[])
      
      const agCors = mp.serviceEvents.reduce((a, i) => {
        return [...a, ...i.corrections]
      }, [] as Correction[])
      
      if (agRots.length && !force) {
        throw new GraphQLError(`MeasPoint (ID${id}) has readouts (cnt: ${agRots.length}), but force attribute is not set.`, {
          extensions: { code: 'HAS_SOME_READOUTS' }
        })
      }

      // Soft remove doesn't cascade we need to remove all respective children
      await trn.getRepository(Correction).softRemove(agCors)
      await trn.getRepository(Readout).softRemove(agRots)
      await trn.getRepository(ServiceEvent).softRemove(mp.serviceEvents)
      await trn.getRepository(Metric).softRemove(mp.metrics)
      await trn.getRepository(MeasPoint).softRemove(mp)

      return true
    })
  }
}