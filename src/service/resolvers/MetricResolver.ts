import { Args, Arg, Ctx, Resolver, Query, Mutation, ID } from "type-graphql";
import { Metric } from "../models";
import { AddMetric, GetMetric, GetMetrics, SetAutoReadout } from "../types/MetricTypes";
import { ApiContext } from "../graphqlServer";

@Resolver(() => Metric)
export class MetricResolver {
  @Query(() => [Metric])
  async metrics(
    @Args() { measPointIds, subjects, readingsFromUTC, readingsToUTC }: GetMetrics,
    @Ctx() ctx: ApiContext
  ): Promise<Metric[]> {
    throw new Error('Not implemented')
  }

  @Query(() => Metric)
  async metric(
    @Args() { id, readingsFromUTC, readingsToUTC }: GetMetric,
    @Ctx() ctx: ApiContext
  ): Promise<Metric> {
    throw new Error('Not implemented')
  }

  @Mutation(() => Metric)
  async enableMetricAutoReadout(
    @Args() args: SetAutoReadout,
    @Ctx() ctx: ApiContext
  ): Promise<Metric> {
    throw new Error('Not implemented')
  }

  @Mutation(() => Metric)
  async disableMetricAutoReadout(
    @Args() args: SetAutoReadout,
    @Ctx() ctx: ApiContext
  ): Promise<Metric> {
    throw new Error('Not implemented')
  }

  @Mutation(() => Metric)
  async addMetric(
    @Arg('data') data: AddMetric,
    @Ctx() ctx: ApiContext
  ): Promise<Metric> {
    throw new Error('Not implemented')
  }

  @Mutation(() => Boolean)
  async deleteMetric(
    @Arg('id', () => ID) id: number,
    @Arg('force') force: boolean,
    @Ctx() ctx: ApiContext
  ): Promise<boolean> {
    throw new Error('Not implemented')
  }
}