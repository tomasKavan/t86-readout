import { DataSource } from 'typeorm'
import { 
  Medium, 
  ConsumptionPlace, 
  ConsumptionQhourly,
  ConsumptionHourly,
  ConsumptionDaily,
  ConsumptionMonthly,
  Meter,
  MeterInstallation,
  MeterReadoutLog,
  MeterType
} from './models/index'

export default function initDataSource (config) {
  return new DataSource({
    type: 'mysql',
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.pass,
    database: config.name,
    entities: [
      Medium, 
      ConsumptionPlace, 
      ConsumptionQhourly, 
      ConsumptionHourly,
      ConsumptionDaily,
      ConsumptionMonthly,
      Meter, 
      MeterInstallation, 
      MeterReadoutLog, 
      MeterType
    ],
    synchronize: true,
    logging: config.logging,
    
    // Set TypeORM DB <-> JS Date parsion to UTC. All dates in DB are stored as UTC!!!
    timezone: 'Z' 
  })
}
