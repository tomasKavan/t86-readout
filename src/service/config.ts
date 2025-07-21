import { LoggerOptions, LogLevel } from "typeorm"
import { DbDataSourceConfigOptions } from "./dbDataSource"
import { MbusDataSourceConfigOptions } from "./mbusDataSource"
import { SchedulerOptions } from "./scheduler"
import dotenv from 'dotenv'

interface Config {
  logLevel: string,
  db: DbDataSourceConfigOptions,
  mbus: MbusDataSourceConfigOptions,
  scheduler: SchedulerOptions
}

dotenv.config()

const config: Config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER || 'readout',
    pass: process.env.DB_PASS || 'oh.G.read.4',
    name: process.env.DB_NAME || 'readout2',
    logging: processLoggerOptions(process.env.DB_LOGLEVEL)
  },
  mbus: {
    host: process.env.MBUS_HOST || '127.0.0.1',
    port: parseInt(process.env.MBUS_PORT ?? '1234'),
    timeout: parseInt(process.env.MBUS_TIMEOUT_MS ?? '4000')
  },
  scheduler: {
    offset: parseInt(process.env.SCHEDULE_OFFSET_MS ?? '0'),
    each: parseInt(process.env.SCHEDULE_EACH_MS ?? '900000') // Default each 15 minutes
  }
}

export default config

function processLoggerOptions(envOpts?: string): LoggerOptions {
  const levels = ["query", "schema", "error", "warn", "info", "log", "migration"]

  if (!envOpts) {
    return false
  }
  if (envOpts === 'true') {
    return true
  }
  if (envOpts === 'all') {
    return 'all'
  }
  
  return envOpts.split(':').filter(item => levels.includes(item)) as LogLevel[]
}

function booleanFromEnv(envOpt: string) {
  return envOpt && (envOpt.toLowerCase() === 'true' || envOpt === '1')
}
