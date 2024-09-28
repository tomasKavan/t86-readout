import 'reflect-metadata'
import { 
  Medium, 
  ConsumptionPlace, 
  ConsumptionQhourly,
  ConsumptionHourly,
  ConsumptionDaily,
  ConsumptionMonthly,
  Meter,
  MeterInstallation,
  MeterReadoutLog,
  MeterType
} from './models/index'
import { DataSource } from 'typeorm'
import { readout } from './readout/readout'
import { consumption } from './consumption/consumption'
import express from 'express'

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'readout',
  password: 'oh.G.read.4',
  database: 'readout',
  entities: [
    Medium, 
    ConsumptionPlace, 
    ConsumptionQhourly, 
    ConsumptionHourly,
    ConsumptionDaily,
    ConsumptionMonthly,
    Meter, 
    MeterInstallation, 
    MeterReadoutLog, 
    MeterType
  ],
  synchronize: true,
  logging: ['error']
})

AppDataSource.initialize()
.then(async () => {
  await run()
})
.catch((error) => console.log(error))

const MS = 1000*60*15 // 15 minutes

function eachXMinQuarterly(minute: number, prev: Date, now: Date): boolean {
  const tresh = new Date(now)
  tresh.setMinutes(Math.floor((now.getMinutes()-minute)/15)*15+minute, 0, 0)
  return !prev || (prev.getTime() < tresh.getTime() && now.getTime() >= tresh.getTime()) 
}

async function run() {
  let prevTime: Date | null = null
  while(1) {
    const now = new Date()
    try { 
      if (eachXMinQuarterly(10, prevTime, now)) {
        // Each quartehour at 10th minute run readout
        console.log(`--- Commence readout [${new Date()}] ---`)
        await readout(AppDataSource) 
        console.log(`--- Readout done [${new Date()}]---`)
      }
      if (eachXMinQuarterly(1, prevTime, now)) {
        // Each quarterhour at 1st minute run consumption
        console.log(`--- Note consumption [${new Date()}] ---`)
        await consumption(AppDataSource) 
        console.log(`--- Consumption noted [${new Date()}]---`)
      }
    } catch (e) {
      console.log(`ERROR:`)
      console.log(e)
      console.log(`---------------------------------`)
    }
    
    // Wait 1 minute
    console.log('Wait next tick in 1m')
    await wait(60000)
    prevTime = now
  }
} 

async function wait(ms): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

const app = express()

// app.get('/api/stats/:od/:do/:step', async (req, res) => {
//   const odD = new Date(req.params.od + 'T00:00')
//   const doD = new Date(req.params.do + 'T00:00')
//   const step = _getStep(req.params.step)

//   if (!odD || !doD || !step) {
//     res.status(400)
//     res.send('Invalid input params. Path should be /api/stats/<YYYY-MM-DD>/<YYYY-MM-DD>/<qh|h|d|m|y>')
//     return
//   }
// })

// enum Steps {
//   QHOUR = 'qh',
//   HOUR = 'h',
//   DAY = 'd',
//   MONTH = 'm',
//   YEAR = 'y'
// }
// function _getStep(str: string | null) : string | null {
//   if (!str || !(str in Steps)) {
//     return null
//   }
//   return str
// }

app.get('/api/spotreba/:od/:do', async (req, res) => {
  const odD = new Date(req.params.od + 'T00:00')
  const doD = new Date(req.params.do + 'T00:00')

  if (!odD || !(odD instanceof Date) || !doD || !(doD instanceof Date)) {
    res.status(400)
    res.send('Invalid input params. Path should be /api/spotreba/<YYYY-MM-DD>/<YYYY-MM-DD>')
    return
  }

  odD.setDate(odD.getDate() + 1)
  doD.setDate(doD.getDate() + 2)

  console.log('[API]: Query /api/spotreba/:from/:to [' + odD + ' - ' + doD + ']')

  const list = await AppDataSource.manager
    .createQueryBuilder(ConsumptionDaily, 'cd')
    .innerJoinAndSelect('cd.consumptionPlace', 'cp')
    .where('cd.time >= :od', {od: odD})
    .andWhere('cd.time < :do', {do: doD})
    .getMany()
  
  const resData = {}
  for (const item of list) {
    let mb = resData[item.consumptionPlace.mbusPrimary]
    if (!mb) {
      mb = {
        mbus: item.consumptionPlace.mbusPrimary,
        sum: 0,
        days: []
      }
      resData[item.consumptionPlace.mbusPrimary] = mb
    }
    const date = new Date(item.time)
    //date.setDate(date.getDate() - 1)
    mb.sum += item.value
    mb.days.push({
      day: date.toISOString().substring(0,10),
      value: item.value
    })
  }

    res.json(resData)
})

app.get('/api/meridlo', async (req, res) => {
  console.log('[API]: Query /api/meridlo')
  const list = await AppDataSource.manager
    .createQueryBuilder(Meter, 'm')
    .innerJoinAndSelect('m.type', 'mt')
    // .innerJoinAndSelect('mt.medium', 'me')
    .innerJoinAndSelect('m.installations', 'i')
    .innerJoinAndSelect('i.consumptionPlace', 'cp')
    .orderBy('m.id')
    .getMany()
  
  res.json(list)
})

app.get('/api/meridlo-typ', async (req, res) => {
  console.log('[API]: Query /api/meridlo-typ')
  const list = await AppDataSource.manager
    .createQueryBuilder(MeterType, 'mt')
    .innerJoinAndSelect('mt.medium', 'me')
    .getMany()
  
  res.json(list)
})

app.get('/api/medium', async (req, res) => {
  console.log('[API]: Query /api/medium')
  const list = await AppDataSource.manager
    .createQueryBuilder(Medium, 'm')
    .getMany()
  
  res.json(list)
})

app.listen(8086, () => {
  console.log('API Listening on port 8086')
})