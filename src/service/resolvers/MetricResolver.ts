import { Args, Arg, Ctx, Resolver, Query, Mutation, ID } from "type-graphql";
import { Correction, MeasPoint, Metric, Readout } from "../models";
import { AddMetric, GetMetric, GetMetrics, GetWithReadings } from "../types/MetricTypes";
import { ApiContext } from "../graphqlServer";
import { And, EntityManager, FindOperator, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError } from "graphql";

@Resolver(() => Metric)
export class MetricResolver {
  @Query(() => [Metric])
  async metrics(
    @Args() params: GetMetrics,
    @Ctx() ctx: ApiContext
  ): Promise<Metric[]> {
    return await ctx.ds.transaction(async trn => {
      const where: FindOptionsWhere<MeasPoint> = {}
      if (params.measPointIds && params.measPointIds.length) {
        where.id = In(params.measPointIds)
      }
      if (params.subjects && params.subjects.length) {
        where.subject = In(params.subjects)
      }

      const mp = await trn.getRepository(MeasPoint).find({
        where,
        relations: ['metrics', 'metrics.corrections', 'metrics.serviceEvent']
      })

      const ms = mp.reduce((a, i) => {
        return [...a, ...i.metrics]
      }, [] as Metric[])

      for (const m of ms) {
        const rots = await this.filterReadouts(params, trn)
        if (rots) m.readouts = rots
      }

      return ms
    })
  }

  @Query(() => Metric)
  async metric(
    @Args() params: GetMetric,
    @Ctx() ctx: ApiContext
  ): Promise<Metric> {
    return await ctx.ds.transaction(async trn => {
      const m = await trn.getRepository(Metric).findOne({ 
        where : { id: params.id },
        relations: ['measPoint', 'corrections', 'corrections.serviceEvent']
      })

      if (!m) {
        throw new GraphQLError(`Metric with ID ${params.id} not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      const rots = await this.filterReadouts(params, trn)
      if (rots) m.readouts = rots

      return m
    })
  }

  @Mutation(() => Metric)
  async addMetric(
    @Arg('measPointId', () => ID) measPointId: string,
    @Arg('data') data: AddMetric,
    @Ctx() ctx: ApiContext
  ): Promise<Metric> {
    return await ctx.ds.transaction(async trn => {
      const mp = await trn.getRepository(MeasPoint).findOneBy({ id: measPointId })
      if (!mp) {
        throw new GraphQLError(`MeasPoint with ID ${measPointId} not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      const mrepo = trn.getRepository(Metric)
      const m = mrepo.create(data)
      m.measPoint = mp
      
      await mrepo.save(m)
      
      return m
    })
  }

  @Mutation(() => Boolean)
  async deleteMetric(
    @Arg('id', () => ID) id: number,
    @Arg('force') force: boolean,
    @Ctx() ctx: ApiContext
  ): Promise<boolean> {
    return await ctx.ds.transaction(async trn => {
      const mrepo = trn.getRepository(Metric)
      const rrepo = trn.getRepository(Readout)
      const crepo = trn.getRepository(Correction)

      const m = await mrepo.findOne({ where: { id: id } })

      if (!m) {
        throw new GraphQLError(`Metric with ID ${id} not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      
      const count = await rrepo.count({
        where: { metric: { id: id }}
      })
      if (count && !force) {
        throw new GraphQLError(`Can't delete Metric with ID ${id}. There is ${count} readouts, but force param is not set.`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }

      // Soft delete won't cascade
      await rrepo.softDelete({ metric: { id: id }})
      await crepo.softDelete({ metric: { id: id }})
      await mrepo.softDelete({ id: id })

      return true
    })
  }

  async filterReadouts(
    params: GetWithReadings, 
    trn: EntityManager
  ): Promise<Readout[] | undefined> {
    // Construct readout poerator
    const opFrom = MoreThanOrEqual(params.readingsFromUTC)
    const opTo = LessThanOrEqual(params.readingsToUTC)
    let op: FindOperator<Date | undefined> | null = null
    if (params.readingsToUTC) {
      op = opTo
      if (params.readingsFromUTC) {
        op = And(opFrom, opTo)
      } else {
        op = opFrom
      }
    }
      
    let out = undefined
    if (op) {
      out = await trn.getRepository(Readout).findBy({
        meterUTCTimestamp: op as FindOperator<Date>
      })
    }
    return out
  }
}