import { ArgsType, Field, GraphQLISODateTime, ID, InputType, Int, InterfaceType } from "type-graphql";
import { Func, MetricType, Subject } from "../models/MetricEnums";
import { Metric } from "../models";

@InputType()
export class AddMetric implements Partial<Metric> {
  @Field(() => MetricType)
  type!: MetricType

  @Field(() => Func)
  func!: Func

  @Field(() => Boolean)
  hasPhysicalDisplay: boolean = false

  @Field(() => Int, { nullable: true })
  mbusValueRecordId?: number | null

  @Field(() => Int, { nullable: true })
  mbusDecimalShift?: number | null
}

@ArgsType()
export class GetWithReadings {
  @Field(() => GraphQLISODateTime, { nullable: true })
  readingsFromUTC?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  readingsToUTC?: Date
}

@ArgsType()
export class GetMetric extends GetWithReadings {
  @Field(() => ID)
  id!: number
}

@ArgsType()
export class GetMetrics extends GetWithReadings {
  @Field(() => [String], { nullable: true })
  measPointIds?: string[]

  @Field(() => [Subject], { nullable: true })
  subjects?: Subject[]
}