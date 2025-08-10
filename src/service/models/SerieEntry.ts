import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql"
import Big from "big.js"

import { Metric } from "./Metric"
import { BigScalar } from "../scalars/BigScalar"

@ObjectType()
export class SerieEntry {
  constructor(metricId: number, timestampUTCISO: string, value: string) {
    this.metricId = metricId
    this.timestampUTC = new Date(timestampUTCISO)
    this.value = new Big(value)
  }
  
  @Field(() => GraphQLISODateTime)
  public timestampUTC!: Date

  @Field(() => Int)
  public metricId!: number

  @Field(() => BigScalar)
  public value!: Big
}