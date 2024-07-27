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
    
    // Wait 5 seconds
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