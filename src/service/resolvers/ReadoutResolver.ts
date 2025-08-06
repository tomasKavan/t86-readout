import { Arg, Ctx, ID, Mutation, Resolver } from "type-graphql"
import Big from "big.js"
import { ApolloServerErrorCode } from "@apollo/server/errors"
import { GraphQLError } from "graphql"

import { Metric, Readout } from "../models"
import { AddReadout, AddReadoutError } from "../types/ReadoutTypes"
import { ApiContext } from "../graphqlServer"
import { Source, Type } from "../models/Readout"
import { logger } from "../logger"

@Resolver(() => Readout)
export class ReadoutResolver {
  @Mutation(() => Readout)
  async addReadout(
    @Arg('data') data: AddReadout,
    @Ctx() ctx: ApiContext
  ): Promise<Readout> {
    return ctx.ds.transaction(async trn => {
      const rorep = trn.getRepository(Readout)
      const r = rorep.create()
      r.metric = { id: data.metricId } as Metric
      r.value = data.value
      r.meterUTCTimestamp = data.timestampUTC
      r.source = Source.MANUAL
      r.type = Type.READOUT
    
      const res = await rorep.save(r)
      logger.info(`[ReadoutResolver] ID ${res.id}, Metric ${data.metricId} stored with value ${data.value} at ${data.timestampUTC}.`)

      return res
    })
  }

  @Mutation(() => [Readout])
  async addReadouts(
    @Arg('data', () => [AddReadout]) data: AddReadout[],
    @Ctx() ctx: ApiContext
  ): Promise<Readout[]> {
    return ctx.ds.transaction(async trn => {
      const rorep = trn.getRepository(Readout)
      const list: Partial<Readout>[] = []
      for (const inp of data) {
        const r = rorep.create()
        r.metric = { id: inp.metricId } as Metric
        r.value = inp.value
        r.meterUTCTimestamp = inp.timestampUTC
        r.source = Source.MANUAL
        r.type = Type.READOUT
        list.push(r)
      }
      
      const res = await rorep.save(list)
      logger.info(`[ReadoutResolver] ${res.length} Readouts stored.`)
      logger.debug(`[ReadoutResolver] -- data: ${list}`)
      
      return res
    })
  }

  @Mutation(() => Readout)
  async addReadoutError(
    @Arg('data', () => AddReadoutError) data: AddReadoutError,
    @Ctx() ctx: ApiContext
  ): Promise<Readout> {
    return ctx.ds.transaction(async trn => {
      const rorep = trn.getRepository(Readout)
      const r = rorep.create()
      r.metric = { id: data.metricId } as Metric
      r.value = new Big(0)
      r.meterUTCTimestamp = data.timestampUTC
      r.source = Source.MANUAL
      r.type = Type.ERROR
      r.errCode = data.errCode
      r.errDetail = data.errDetail
    
      const res = await rorep.save(r)
      logger.info(`[ReadoutResolver] ID ${res.id}, Metric ${data.metricId} stored Error ${data.errCode} at ${data.timestampUTC}.`)
      logger.debug(`[ReadoutResolver] -- details: ${data.errDetail}`)

      return res
    })
  }

  @Mutation(() => Boolean)
  async deleteReadout(
    @Arg('id', () => ID) id: number,
    @Ctx() ctx: ApiContext
  ): Promise<boolean> {
    return ctx.ds.transaction(async trn => {
      const rorep = trn.getRepository(Readout)
      if (! (await rorep.count({ where: { id }}))) {
        throw new GraphQLError(`Readout with ID ${id} not found, can't delete it`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }
      await rorep.softDelete({ id })
      logger.info(`[ReadoutResolver] ID ${id} soft removed.`)

      return true
    })
  }
}