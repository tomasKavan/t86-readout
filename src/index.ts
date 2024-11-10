import 'reflect-metadata'

import express from 'express'
import config from './config'
import ApiRouter from './api/index'
import Scheduler from './schedule'
import DataSource from './dataSource'

const appDataSource = DataSource(config.db)
const apiRouter = ApiRouter(appDataSource, config.api)
const scheduler = Scheduler(appDataSource, config.schedule)

const api = express()
api.use('/api', apiRouter)

appDataSource.initialize()
.then(async () => {
  // Set Timezone to UTC - All dates in DB are stored as UTC!!!
  await appDataSource.manager.query('SET @@session.time_zone = \'+00:00\';')
  console.log(`[DataSource] initialized`)

  // Run API HTTP server
  api.listen(config.api.port, () => {
    console.log(`[API] Listening on port ${config.api.port}`)
  })

  // Run scheduler
  scheduler.run()
  console.log(`[Scheduler] reading out meteres in ${config.schedule.readoutMinute} minute; processing consumption in ${config.schedule.consumptionMinute} minute`)
})
.catch((error) => console.log(error))
