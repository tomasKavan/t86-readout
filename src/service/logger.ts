import { createLogger, format, transport, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import config from "./config"

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
  format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
)

const colorizedLogFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
  format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
)

export const logger = createLogger({
  level: config.logLevel,
  format: logFormat,
  transports: [
    new transports.Console({
      format: colorizedLogFormat
    }),
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'readout-log-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: 10,
      maxFiles: '30d'
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'readout-exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: 10,
      maxFiles: '30d'
    })
  ]
})