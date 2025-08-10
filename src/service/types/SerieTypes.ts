import { Field, GraphQLISODateTime, ID, InputType } from 'type-graphql'

import { Sampling } from '../models/Serie'

@InputType()
export class QuerySerie {
  @Field(() => GraphQLISODateTime)
  fromUTC!: Date

  @Field(() => GraphQLISODateTime)
  toUTC!: Date

  @Field(() => Sampling)
  sampling: Sampling = Sampling.Q

  @Field(() => [ID])
  metricIds: number[] = []
}