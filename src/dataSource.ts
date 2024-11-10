import { DataSource } from 'typeorm'
import { modelsArray, subscribersArray } from './models/index'

export default function initDataSource (config) {
  return new DataSource({
    type: 'mysql',
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.pass,
    database: config.name,
    entities: modelsArray,
    subscribers: subscribersArray,
    synchronize: true,
    logging: config.logging,
    
    // Set TypeORM DB <-> JS Date parsion to UTC. All dates in DB are stored as UTC!!!
    timezone: 'Z' 
  })
}
