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

  @Field(() => String, { nullable: true })
  instDetails?: string = ''

  @Field(() => String, { nullable: true })
  notes: string = ''

  @Field(() => Subject)
  subject!: Subject

  @Field(() => SubjectSpec, { nullable: true })
  subjectSpec?: SubjectSpec | null = null

  @Field(() => Int, { nullable: true })
  mbusAddr?: number | null = null

  @Field(() => String, { nullable: true })
  mbusSerial?: string | null = null

  @Field(() => String, { nullable: true })
  meterManufacturer?: string | null = null

  @Field(() => String, { nullable: true })
  meterType?: string | null = null

  @Field(() => Boolean)
  autoReadoutEnabled: boolean = false

  @Field(() => [AddMetric], { nullable: true })
  metrics: AddMetric[] = []
}

@InputType()
export class UpdateMeasPoint {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  roomNo?: string

  @Field(() => String, { nullable: true })
  instDetails?: string

  @Field(() => String, { nullable: true })
  notes?: string
}

@InputType()
export class ChangeMeterCorrection {
  @Field()
  metricId!: number

  @Field(() => BigScalar, { nullable: true })
  value: Big = new Big(0)

  @Field(() => BigScalar, { nullable: true })
  oldMeterEndValue?: Big | null

  @Field(() => BigScalar, { nullable: true })
  newMeterStartValue?: Big | null

  @Field(() => Boolean, { nullable: true })
  hasPhysicalDisplay?: boolean

  @Field(() => Int, { nullable: true })
  mbusValueRecordId?: number | null

  @Field(() => Int, { nullable: true })
  mbusDecimalShift?: number | null

}

@InputType()
export class ChangeMeter {
  @Field(() => GraphQLISODateTime)
  occuredUTCTime!: Date

  @Field(() => Int, { nullable: true })
  mbusAddr?: number | null

  @Field(() => String, { nullable: true })
  mbusSerial?: string | null

  @Field(() => String, { nullable: true })
  meterManufacturer?: string

  @Field(() => String, { nullable: true })
  meterType?: string

  @Field(() => String, { nullable: true })
  comments?: string | null

  @Field(() => [ChangeMeterCorrection])
  corrections: ChangeMeterCorrection[] = []
}