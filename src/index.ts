import 'reflect-metadata'

import express from 'express'
import config from './config'
import ApiRouter from './api/index'
import DataSource from './dataSource'
import ReadoutScheduler from './readout'

const appDataSource = DataSource(config.db)
const apiRouter = ApiRouter(appDataSource, config.api)
const readoutScheduler = ReadoutScheduler(appDataSource, config.schedule)

const api = express()
api.use('/api', apiRouter)

appDataSource.initialize()
.then(async () => {
  // Set Timezone to UTC - All dates in DB are stored as UTC!!!
  await appDataSource.manager.query('SET @@session.time_zone = \'+00:00\';')
  console.log(`[index:DataSource] initialized`)

  // Run API HTTP server
  api.listen(config.api.port, () => {
    console.log(`[index:API] Listening on port ${config.api.port}`)
  })

  // Run readout scheduler
  readoutScheduler.enable()
  console.log(`[index:Readout] Scheduling enabled`)

  // Run Data Series processing scheduler
  await DataSeries.schedule(appDataSource)
  console.log(`[index:Data Series] Scheduling finished`)
})
.catch((error) => console.log(error))
