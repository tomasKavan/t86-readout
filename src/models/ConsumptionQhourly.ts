import { 
  Entity, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  Column, 
  Unique
} from "typeorm";
import { ConsumptionPlace } from "./ConsumptionPlace";
  
@Entity()
@Unique(['consumptionPlace', 'time'])
export class ConsumptionQhourly {
  @PrimaryGeneratedColumn()
  public readonly id: number
  
  @ManyToOne(() => ConsumptionPlace, cp => cp.consumptionQhourly, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public consumptionPlace: ConsumptionPlace

  @Column("datetime", {nullable: false})
  public time: Date 

  @Column("int", {nullable: false})
  public value: number
}