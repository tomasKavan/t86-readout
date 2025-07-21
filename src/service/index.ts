import 'reflect-metadata'

import config from './config'
import DbDataSource from './dbDataSource'
import MbusDataSource from './mbusDataSource'
import Scheduler from './scheduler'
import { logger } from './logger'

const db = DbDataSource(config.db)
const mbus = MbusDataSource(config.mbus)
const scheduler = Scheduler(config.scheduler)

db.initialize()
.then(async () => {
  // Set Timezone to UTC - All dates in DB are stored as UTC!!!
  await db.manager.query('SET @@session.time_zone = \'+00:00\';')
  logger.debug(`[index:DB] registered Entities: ${db.entityMetadatas.map(e => e.name)}`)
  logger.info(`[index:DB] initialized`)

  // Run readout scheduler
  scheduler.add(async () => {
    await mbus.readout(db)
  })
  scheduler.enable(true)
  logger.info(`[index:Readout] Scheduling enabled`)

})
.catch((error) => logger.error(error))

process.on('uncaughtException', err => {
  logger.error(`Uncaught exception: ${err.stack || err.message}`)
})

process.on('unhandledRejection', reason => {
  const message = reason instanceof Error ? reason.stack : JSON.stringify(reason)
  logger.error(`Unhandled Rejection:\n${message}`)
})
