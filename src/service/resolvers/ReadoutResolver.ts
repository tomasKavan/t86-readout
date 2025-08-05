import { Arg, Ctx, ID, Mutation, Resolver } from "type-graphql";
import { Readout } from "../models";
import { AddReadout, AddReadoutError } from "../types/ReadoutTypes";
import { ApiContext } from "../graphqlServer";

@Resolver(() => Readout)
export class ReadoutResolver {
  @Mutation(() => Readout)
  async addReadout(
    //@Arg('data') data: AddReadout,
    @Ctx() ctx: ApiContext
  ): Promise<Readout> {
    throw new Error('Not implemented')
  }

  // @Mutation(() => [Readout])
  // async addReadouts(
  //   @Arg('data', () => [AddReadout]) data: AddReadout[],
  //   @Ctx() ctx: ApiContext
  // ): Promise<Readout> {
  //   throw new Error('Not implemented')
  // }

  // @Mutation(() => Readout)
  // async addReadoutError(
  //   @Arg('data', () => AddReadoutError) data: AddReadoutError,
  //   @Ctx() ctx: ApiContext
  // ): Promise<Readout> {
  //   throw new Error('Not implemented')
  // }

  // @Mutation(() => Readout)
  // async updateReadout(
  //   @Arg('id', () => ID) id: number,
  //   @Arg('data', () => AddReadout) data: AddReadout,
  //   @Ctx() ctx: ApiContext
  // ): Promise<Readout> {
  //   throw new Error('Not implemented')
  // }
}