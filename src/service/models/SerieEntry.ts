import { Field, GraphQLISODateTime, ObjectType } from "type-graphql"
import Big from "big.js"

import { Metric } from "./Metric"
import { BigScalar } from "../scalars/BigScalar"

@ObjectType()
export class SerieEntry {
  @Field(() => GraphQLISODateTime)
  public timestampUTC!: Date

  @Field(() => Metric)
  public metric!: Metric

  @Field(() => BigScalar)
  public value!: Big
}