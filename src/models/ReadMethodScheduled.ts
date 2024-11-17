import { BeforeInsert, BeforeUpdate, ChildEntity, Column } from "typeorm"
import { isValidCron } from "cron-validator"
import { ReadMethod } from "./ReadMethod"

@ChildEntity()
export abstract class ReadMethodScheduled extends ReadMethod {
  @Column('varchar')
  public cronUTCExpression: string

  @BeforeInsert()
  @BeforeUpdate()
  validateCronUTCExpression() {
    if (!isValidCron(this.cronUTCExpression)) {
      throw new Error(`Invaid CRON Expression ${this.cronUTCExpression}`)
    }
  }
}
