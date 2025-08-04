import { Field, GraphQLISODateTime, ID, InputType, Int } from "type-graphql";
import { Subject, SubjectSpec } from "../models/MetricEnums";
import { AddMetric } from "./MetricTypes";
import { MeasPoint } from "../models";
import { BigScalar } from "../scalars/BigScalar";
import Big from "big.js";

@InputType()
export class AddMeasPoint {
  @Field(() => ID)
  id!: string

  @Field()
  name!: string

  @Field()
  roomNo!: string

  @Field()
  instDetails: string = ''

  @Field()
  notes: string = ''

  @Field()
  subject!: Subject

  @Field()
  subjectSpec?: SubjectSpec

  @Field()
  mbusAddr?: number

  @Field()
  mbusSerial?: string

  @Field()
  meterManufacturer?: string

  @Field()
  meterType?: string

  @Field(() => AddMetric)
  metrics: AddMetric[] = []
}

@InputType()
export class UpdateMeasPoint {
  @Field()
  name?: string

  @Field()
  roomNo?: string

  @Field()
  instDetails?: string

  @Field()
  notes?: string
}

@InputType()
export class ChangeMeterCorrection {
  @Field()
  metricId!: number

  @Field(() => BigScalar)
  value!: Big

  @Field(() => BigScalar, { nullable: true })
  oldMeterEndValue?: Big

  @Field(() => BigScalar, { nullable: true })
  newMeterStartValue?: Big

}

@InputType()
export class ChangeMeter {
  @Field(() => Int, { nullable: true })
  mbusAddr?: number

  @Field(() => String, { nullable: true })
  mbusSerial?: string

  @Field(() => String)
  meterManufacturer!: string

  @Field(() => String)
  meterType?: string

  @Field(() => String, { nullable: true })
  comments?: String

  @Field(() => GraphQLISODateTime)
  occuredUTCTime!: Date

  @Field(() => [ChangeMeterCorrection])
  corrections: ChangeMeterCorrection[] = []
}