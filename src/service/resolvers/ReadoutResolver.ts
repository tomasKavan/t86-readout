import { Arg, Ctx, Field, GraphQLISODateTime, ID, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql"
import Big from "big.js"
import { ApolloServerErrorCode } from "@apollo/server/errors"
import { GraphQLError } from "graphql"

import { Metric, Readout } from "../models"
import { AddReadout, AddReadoutError } from "../types/ReadoutTypes"
import { ApiContext } from "../graphqlServer"
import { Source, Type } from "../models/Readout"
import { logger } from "../logger"
import { number } from "yargs"
import { And, FindOperator, FindOptions, FindOptionsOrder, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm"

@ObjectType()
class ReadoutList {
  @Field(() => [Readout]) items: Readout[] = []
  @Field() totalCount: number = 0
  @Field() skip: number = 0
}

/**
   * Returns a list of readouts
   * 
   * By attributes `from`, `to` and `metricIds` it's possible to limit an era and scope from 
   * which readouts will selected. All these params are optional. Not included param won't 
   * restrict the select.
   * 
   * The list cursor is driven by `skip` and `take` params. These are required.
   * 
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @param skip - # of skipped records from the beginning of the select
   * @param take - # of records returned. Less or 0 is returned if `skip` is closer to the end of
   *               list than `take` value is.
   * @param from - Oldest included `meterUTCTimestamp`
   * @param to - Youngest included `meterUTCTimestamp`
   * @param metricIds - List of included Metric ids
   * @returns Instance of Metric
   */
@Resolver(() => Readout)
export class ReadoutResolver {
  @Query(() => ReadoutList)
  async readouts(
    @Ctx() ctx: ApiContext,
    @Arg('skip', () => Int) skip: number,
    @Arg('take', () => Int) take: number,
    @Arg('from', () => GraphQLISODateTime, { nullable: true }) from?: Date,
    @Arg('to', () => GraphQLISODateTime, { nullable: true }) to?: Date,
    @Arg('metricIds', () => [ID], { nullable: true }) metricIds?: [number]
  ): Promise<ReadoutList> {
    return ctx.ds.transaction(async trn => {
      // Construct where clause
      const where: FindOptionsWhere<Readout> = {}
      let dateRange: FindOperator<Date> | null = null
      if (!from && to) dateRange = LessThanOrEqual(to)
      if (!to && from) dateRange = MoreThanOrEqual(from)
      if (from && to) dateRange = And(MoreThanOrEqual(from), LessThanOrEqual(to))
      if (dateRange) {
        where.meterUTCTimestamp = dateRange
      }
      if (metricIds) {
        where.metric = { id: In(metricIds)}
      }

      const relations = ['metric']
      const order: FindOptionsOrder<Readout> = { meterUTCTimestamp: 'ASC' }

      const rrepo = trn.getRepository(Readout)
      const [items, totalCount] = await rrepo.findAndCount({ skip, take, where, relations, order })

      return {
        items,
        totalCount,
        skip
      }
    })
  }


  /**
   * Add new readout entry. Source will be set to manual.
   * 
   * @param data structure with data to be inputed in the DB.
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns newly create instance of Readout
   */
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

      const resre = await rorep.findOneOrFail({
        where: { id: res.id },
        relations: ['metric', 'metric.measPoint']
      })

      logger.info(`[ReadoutResolver] ID ${res.id}, Metric ${data.metricId} stored with value ${data.value} at ${data.timestampUTC}.`)

      return resre
    })
  }

  /**
   * Add multiple readout entries. Source will be set to manual.
   * @param data list of structures with data to be inputed in the DB.
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns list of newly create instances of Readout
   */
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

  /**
   * Log an error with source set to manual.
   * 
   * @param data structure with error and timestamp to be inputed in the DB.
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns A newly created Readout instance with error 
   */
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

      const resre = await rorep.findOneOrFail({
        where: { id: res.id },
        relations: ['metric', 'metric.measPoint']
      })

      logger.info(`[ReadoutResolver] ID ${res.id}, Metric ${data.metricId} stored Error ${data.errCode} at ${data.timestampUTC}.`)
      logger.debug(`[ReadoutResolver] -- details: ${data.errDetail}`)

      return resre
    })
  }

  /**
   * Soft delete of a specific readout.
   * 
   * @param id - ID of readout to be deleted
   * @param ctx - GraphQL Server context (passed by Apollo server)
   * @returns true if success (or throws in case of an error)
   */
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