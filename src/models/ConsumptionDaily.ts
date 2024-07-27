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
export class ConsumptionDaily {
  @PrimaryGeneratedColumn()
  public readonly id: number
  
  @ManyToOne(() => ConsumptionPlace, cp => cp.consumptionDaily, {
    onDelete: 'RESTRICT',
    nullable: false
  })
  public consumptionPlace: ConsumptionPlace

  @Column("datetime", {nullable: false})
  public time: Date 

  @Column("int", {nullable: false})
  public value: number
}