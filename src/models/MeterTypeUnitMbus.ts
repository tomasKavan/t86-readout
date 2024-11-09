import { ChildEntity, Column } from "typeorm";
import { MeterTypeUnit } from "./MeterTypeUnit";

@ChildEntity()
export class MeterTypeUnitMbus extends MeterTypeUnit {
  
  @Column('int', { nullable: true })
  public valueRecordId: number
  
}