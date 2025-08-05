import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Scheduler as SchInfo } from "../models/Scheduler";
import { ApiContext } from "../graphqlServer";
import { Scheduler } from "../scheduler";

@Resolver(() => SchInfo)
export class SchedulerResolver {
  @Query(() => SchInfo)
  async scheduler(@Ctx() ctx: ApiContext): Promise<SchInfo> {
    return this._makeInfo(ctx.sch)
  }

  @Mutation(() => SchInfo)
  async executeReadout(
    @Arg('waitForResults') waitForResults: boolean,
    @Ctx() ctx: ApiContext
  ): Promise<SchInfo> {
    await ctx.sch.executeOutOfOrder(waitForResults)
    return this._makeInfo(ctx.sch)
  }

  _makeInfo(sch: Scheduler): SchInfo {
    const schInfo = new SchInfo()
    schInfo.isReadoutRunning = sch.isRunning
    schInfo.lastReadoutUTCTime = sch.lastExecution
    schInfo.lastDurationMs = sch.lastDurationMs
    schInfo.nextReadoutUTCTime = sch.nextExecution
    return schInfo
  }
}