import { Field, Int, ObjectType } from "type-graphql";
import { MBusRecord } from "./MBusRecord";

@ObjectType()
export class MBusSlave {
  @Field(() => Int)
  primaryAddress!: number

  @Field(() => String, { nullable: true })
  manufacturer!: string | null

  @Field(() => String, { nullable: true })
  type!: string | null

  @Field(() => String, { nullable: true })
  medium!: string | null

  @Field(() => String, { nullable: true })
  status!: string | null

  @Field(() => String, { nullable: true })
  serial!: string | null

  @Field(() => [MBusRecord])
  records: MBusRecord[] = []
}