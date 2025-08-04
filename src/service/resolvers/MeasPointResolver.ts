import { Arg, Ctx, ID, Mutation, Query, Resolver } from "type-graphql"
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from "graphql"

import { MeasPoint } from "../models"
import { ApiContext } from "../graphqlServer"
import { AddMeasPoint, ChangeMeter, UpdateMeasPoint } from "../types/MeasPointTypes"
import { updateDefined } from "../utils/objectProc"

@Resolver(() => MeasPoint)
export class MeasPointResolver {
  @Query(() => [MeasPoint])
  async measPoints(@Ctx() ctx: ApiContext): Promise<MeasPoint[]> {
    const mps = await ctx.ds.getRepository(MeasPoint).find({
      relations: ['metrics', 'serviceEvents']
    })
    
    return mps
  }

  @Query(() => MeasPoint)
  async measPoint(@Arg('id') id: string, @Ctx() ctx: ApiContext): Promise<MeasPoint> {
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

      await mprep.save(mp)
      return mp
    })
  }

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
        return mp
      } catch (e) {
        throw new GraphQLError(`MeasPoint with the id [${id}] not found`, {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT }
        })
      }
    })
  }

  @Mutation(() => MeasPoint)
  async changeMeter(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: ChangeMeter,
    @Ctx() ctx: ApiContext
  ): Promise<MeasPoint> {
    throw new Error('Not implemented')
  }
}