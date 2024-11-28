import { LoggerOptions } from "typeorm"
import { DataSourceConfigOptions } from "./dataSource"
import { ReadoutSchedulerOptions } from "./readout"
import { DataSeriesConfigOptions } from "./dataSeries"

interface Config {
  db: DataSourceConfigOptions,
  api: {
    port: number,
    user: string,
    secret: string
  },
  schedule: ReadoutSchedulerOptions,
  dataSeries: DataSeriesConfigOptions
}

const config: Config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3363,
    user: process.env.DB_USER || 'readout',
    pass: process.env.DB_PASS || 'oh.G.read.4',
    name: process.env.DB_NAME || 'readout2',
    logging: processLoggerOptions(process.env.DB_LOGLEVEL)
  },
  api: {
    port: parseInt(process.env.API_PORT) || 8086,
    user: 'readout',
    secret: '65did!U!read?!65'
  },
  schedule: {
    refreshScheduleEachMs: parseInt(process.env.REFRESH_SCHEDULE_EACH_MS) || 1000,
    onStart: booleanFromEnv(process.env.SCHEDULE_ONSTART) || false
  },
  dataSeries: {
    processOnMinute: Math.max(0, Math.min(14, parseInt(process.env.DATASERIES_PROCESS_ON_MINUTE) || 5)),
    onStart: booleanFromEnv(process.env.DATASERIES_ONSTART) || false,
    skipQHoursFromNow: Math.max(1, parseInt(process.env.DATASERIES_SKIP_QHOURS_FROMNOW) || 1)
  }
}

export default config

function processLoggerOptions(envOpts): LoggerOptions {
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
  return envOpts.split(':').filter(item => levels.includes(item))
}

function booleanFromEnv(envOpt: string) {
  return envOpt && (envOpt.toLowerCase() === 'true' || envOpt === '1')
}
