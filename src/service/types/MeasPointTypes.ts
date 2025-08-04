import { Field, ID, InputType } from "type-graphql";
import { Subject, SubjectSpec } from "../models/MetricEnums";
import { AddMetric } from "./MetricTypes";

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