import { DataSource, LoggerOptions } from 'typeorm'
import { modelsArray } from './models/index'

export type DbDataSourceConfigOptions = {
    host: string,
    port: number,
    user: string,
    pass: string,
    name: string,
    logging: LoggerOptions
}

export default function configureDataSource (config: DbDataSourceConfigOptions) {
  return new DataSource({
    type: 'mysql',
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.pass,
    database: config.name,
    entities: modelsArray,
    synchronize: true,
    logging: config.logging,
    
    // Set TypeORM DB <-> JS Date parsion to UTC. All dates in DB are stored as UTC!!!
    timezone: 'Z' 
  })
}
