import { Field, GraphQLISODateTime, Int, ObjectType } from 'type-graphql'

@ObjectType()
export class Scheduler {
  @Field(() => GraphQLISODateTime, { nullable: true })
  public lastReadoutUTCTime!: Date | null

  @Field(() => GraphQLISODateTime, { nullable: true })
  public nextReadoutUTCTime!: Date | null

  @Field(() => Int, { nullable: true })
  public lastDurationMs!: number | null

  @Field(() => Boolean)
  public isReadoutRunning!: boolean
}