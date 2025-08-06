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
