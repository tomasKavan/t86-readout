import { Field, GraphQLISODateTime, ObjectType, registerEnumType } from 'type-graphql'
import { GraphQLTimeZone } from 'graphql-scalars'

import { Metric } from './Metric'
import { SerieEntry } from './SerieEntry'

export enum Sampling {
  Q = 'Q',
  H = 'H',
  D = 'D',
  M = 'M',
  Y = 'Y'
}
registerEnumType(Sampling, {
  name: 'SerieSampling',
  description: 'Sampling interval of data serie. Q - 15 minutes, H - 60 minutes, D - day, M - month, Y - year'
})

@ObjectType()
export class Serie {
  @Field(() => GraphQLISODateTime)
  public fromUTC!: Date

  @Field(() => GraphQLISODateTime)
  public toUTC!: Date

  @Field(() => Sampling)
  public sampling!: Sampling

  @Field(() => [Metric])
  public metrics: Metric[] = []

  @Field(() => [SerieEntry])
  public entries: SerieEntry[] = []

  @Field(() => GraphQLISODateTime)
  public issuedAtUTCtimestamp!: Date

  @Field(() => GraphQLTimeZone)
  public timeZone!: string
}