import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql"
import { BigScalar } from "../scalars/BigScalar"

@ObjectType()
export class MBusRecord {
  @Field(() => Int)
  id!: number

  @Field(() => String, { nullable: true })
  function!: string | null

  @Field(() => Int, { nullable: true })
  storageNumber!: number | null

  @Field(() => Int, { nullable: true })
  tariff!: number | null

  @Field(() => Int, { nullable: true })
  device!: number | null

  @Field(() => String, { nullable: true })
  unit!: string | null

  @Field(() => BigScalar, { nullable: true })
  value!: Big | null

  @Field(() => GraphQLISODateTime)
  timestamp!: Date | null
}