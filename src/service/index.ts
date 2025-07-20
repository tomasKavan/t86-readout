import 'reflect-metadata'

import config from './config'
import DbDataSource from './dbDataSource'
import MbusDataSource from './mbusDataSource'
import Scheduler from './scheduler'

const db = DbDataSource(config.db)
const mbus = MbusDataSource(config.mbus)
const scheduler = Scheduler(config.scheduler)

db.initialize()
.then(async () => {
  // Set Timezone to UTC - All dates in DB are stored as UTC!!!
  await db.manager.query('SET @@session.time_zone = \'+00:00\';')
  console.log(`[index:DataSource] initialized`)

  // Run readout scheduler
  scheduler.add(async () => {
    await mbus.readout(db)
  })
  console.log(`[index:Readout] Scheduling enabled`)

})
.catch((error) => console.log(error))
