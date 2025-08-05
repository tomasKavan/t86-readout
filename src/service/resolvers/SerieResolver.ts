import { Arg, Ctx, Query, Resolver } from 'type-graphql'

import { Serie } from '../models/Serie'
import { QuerySerie } from '../types/SerieTypes'
import { ApiContext } from '../graphqlServer'

@Resolver(() => Serie)
export class SerieResolver {
  @Query(() => Serie)
  async serie(
    @Arg('params') params: QuerySerie,
    @Ctx() ctx: ApiContext
  ): Promise<Serie> {
    throw new Error('Not implementd')
  }
}