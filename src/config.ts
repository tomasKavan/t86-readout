import { LoggerOptions, LogLevel } from "typeorm"

interface Config {
  db: {
    host: string,
    port: number,
    user: string,
    pass: string,
    name: string,
    logging: LoggerOptions
  },
  api: {
    port: number,
    user: string,
    secret: string
  },
  schedule: {
    readoutMinute: number,
    consumptionMinute: number,
    onStart: boolean
  }
}

const config: Config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3363,
    user: process.env.DB_USER || 'readout',
    pass: process.env.DB_PASS || 'oh.G.read.4',
    name: process.env.DB_NAME || 'readout',
    logging: processLoggerOptions(process.env.DB_LOGLEVEL)
  },
  api: {
    port: parseInt(process.env.API_PORT) || 8086,
    user: 'readout',
    secret: '65did!U!read?!65'
  },
  schedule: {
    readoutMinute: parseInt(process.env.SCHEDULE_READOUT_MINUTE) || 10,
    consumptionMinute: parseInt(process.env.SCHEDULE_CONSUMPTION_MINUTE) || 1,
    onStart: booleanFromEnv(process.env.SCHEDULE_ONSTART) || false
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
