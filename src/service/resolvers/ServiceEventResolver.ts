import { Arg, Ctx, ID, Mutation, Resolver } from "type-graphql";
import { ServiceEvent } from "../models";
import { ApiContext } from "../graphqlServer";

@Resolver(() => ServiceEvent)
export class ServiceEventResolver {
  @Mutation(() => Boolean)
  async deleteServiceEvent(
    @Arg('id', () => ID) id: number,
    @Ctx() ctx: ApiContext
  ): Promise<boolean> {
    throw new Error('Not Implemented')
  }
}