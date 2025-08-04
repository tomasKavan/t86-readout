import { Field, InputType } from "type-graphql";
import { Func, MetricType } from "../models/MetricEnums";

@InputType()
export class AddMetric {
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