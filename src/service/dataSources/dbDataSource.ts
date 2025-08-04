import { DataSource, LoggerOptions } from 'typeorm'
import { modelsArray } from '../models/index'
import { logger } from '../logger'

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
    logger: {
      logQuery: (query: string, params: any[]) => {
        logger.debug(`QUERY: ${query} -- ${JSON.stringify(params)}`)
      },
      logQueryError: (error: string | Error, query: string, params: any[] | undefined) => {
        logger.error(`QUERY ERROR: ${error} -- ${query} -- ${JSON.stringify(params)}`)
      },
      logQuerySlow: (time: number, query: string, params: any[] | undefined) => {
        logger.warn(`SLOW QUERY: ${time}ms -- ${query} -- ${JSON.stringify(params)}`)
      },
      log: (level: any, message: any) => {
        logger.log(level as any, message)
      },
      logSchemaBuild: (message: string, queryRunner: any) => {
        logger.debug(`SCHEMA BUILD: ${message}`)
      },
      logMigration: (message: string, queryRunner: any) => {
        logger.info(`MIGRATION: ${message}`)
      }
    },
    
    // Set TypeORM DB <-> JS Date parsion to UTC. All dates in DB are stored as UTC!!!
    timezone: 'Z' 
  })
}
