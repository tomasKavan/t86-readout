import { Field, GraphQLISODateTime, ID, InputType } from "type-graphql"
import Big from "big.js"

import { ErrCode } from "../readout/mbus/MbusReadout"
import { BigScalar } from "../scalars/BigScalar"

@InputType()
export class AddReadout {
  @Field(() => ID)
  metricId!: number

  @Field(() => BigScalar)
  value!: Big

  @Field(() => GraphQLISODateTime)
  timestampUTC!: Date
}

@InputType()
export class AddReadoutError {
  @Field(() => ID)
  metricId!: number

  @Field(() => GraphQLISODateTime)
  timestampUTC!: Date

  @Field(() => ErrCode)
  errCode!: ErrCode

  @Field()
  errDetail!: string
}

@InputType()
export class UpdateReadout {
  @Field(() => BigScalar)
  value?: Big

  @Field(() => ErrCode, { nullable: true })
  errCode?: ErrCode | null

  @Field({ nullable: true })
  errDetail?: string | null

  @Field(() => GraphQLISODateTime)
  timestampUTC?: Date
}

@InputType()
export class UpdateReadoutError {
  @Field(() => GraphQLISODateTime)
  timestampUTC!: Date

  
}