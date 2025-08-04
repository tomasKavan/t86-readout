import { ArgsType, Field, GraphQLISODateTime, ID, InputType, Int, InterfaceType } from "type-graphql";
import { Func, MetricType, Subject } from "../models/MetricEnums";
import { Metric } from "../models";

@InputType()
export class AddMetric implements Partial<Metric> {
  @Field()
  type!: MetricType

  @Field()
  func!: Func

  @Field()
  hasPhysicalDisplay: boolean = false
  
  @Field()
  autoReadoutEnabled: boolean = false

  @Field()
  mbusValueRecordId?: number

  @Field()
  mbusDecimalShift?: number
}

@ArgsType()
class GetWithReadings {
  @Field(() => GraphQLISODateTime, { nullable: true })
  readingsFromUTC?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  readingsToUTC?: Date
}

@ArgsType()
export class GetMetric extends GetWithReadings {
  @Field(() => ID)
  id!: number

  @Field(() => [Subject], { nullable: true })
  subjects?: Subject[]
}

@ArgsType()
export class GetMetrics extends GetWithReadings {
  @Field(() => [String], { nullable: true })
  measPointIds?: string[]

  @Field(() => [Subject], { nullable: true })
  subjects?: Subject[]
}

@ArgsType()
export class SetAutoReadout {
  @Field(() => Int, { nullable: true })
  id?: number

  @Field(() => [String], { nullable: true })
  measPointIds?: string[]

  @Field(() => [Subject], { nullable: true })
  subjects?: Subject[]

  @Field(() => Boolean, { nullable: true })
  all?: boolean
}