import 'reflect-metadata'

import config from './config'
import DbDataSource from './dataSources/dbDataSource'
import MbusDataSource from './dataSources/mbusDataSource'
import Scheduler from './scheduler'
import Api from './graphqlServer'
import { logger } from './logger'

const db = DbDataSource(config.db)
const mbus = MbusDataSource(config.mbus)
const scheduler = Scheduler(config.scheduler)
const api = Api(config.api)

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
  scheduler.enable()
  logger.info(`[index:Readout] Scheduling enabled (each ${config.scheduler.each / 1000}s). Fire on enable: ${config.scheduler.fireOnEnable ? 'TRUE' : 'FALSE'}`)

  const apiUrl = await api.start(db, scheduler, mbus.mbus)
  logger.info(`[index:API] Api listening on: ${apiUrl}`)

})
.catch((error) => {
  logger.error(error.toString())
})

process.on('uncaughtException', err => {
  logger.error(`Uncaught exception: ${err.stack || err.message}`)
})

process.on('unhandledRejection', reason => {
  const message = reason instanceof Error ? reason.stack : JSON.stringify(reason)
  logger.error(`Unhandled Rejection:\n${message}`)
})
