import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  Unique,
  Column 
} from "typeorm";
import { ConsumptionPlace } from "./ConsumptionPlace";
  
@Entity()
@Unique(['consumptionPlace', 'time'])
export class ConsumptionMonthly {
  @PrimaryGeneratedColumn()
  public readonly id: number
  
  @ManyToOne(() => ConsumptionPlace, cp => cp.consumptionMonthly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public consumptionPlace: ConsumptionPlace

  @Column("datetime", {nullable: false})
  public time: Date 

  @Column("int", {nullable: false})
  public value: number
}