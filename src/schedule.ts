import { readout } from './readout'
import { consumption } from './consumption/consumption'

const MIN_MS = 1000 * 60
const QH_MS = MIN_MS * 15

function eachXMinQuarterly(minute: number, prev: Date, now: Date): boolean {
  const ts = now.getTime()
  const qts = Math.floor(ts / QH_MS) * QH_MS
  const tresh = new Date(qts + minute * MIN_MS )
  return !prev || (
    prev.getTime() < tresh.getTime() 
    && now.getTime() >= tresh.getTime()
  ) 
}

async function wait(ms): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export default function(AppDataSource, config) {
  return { 
    run: async function run() {
      let prevTime: Date | null = null
      while(1) {
        const now = new Date()
        try { 
          if (eachXMinQuarterly(config.readoutMinute, prevTime, now)) {
            // Each quartehour at 10th minute run readout
            console.log(`[Scheduler] --- Commence readout [${new Date()}] ---`)
            await readout(AppDataSource) 
            console.log(`[Scheduler] --- Readout done [${new Date()}]---`)
          }
          if (eachXMinQuarterly(config.consumptionMinute, prevTime, now)) {
            // Each quarterhour at 1st minute run consumption
            console.log(`[Scheduler] --- Note consumption [${new Date()}] ---`)
            await consumption(AppDataSource) 
            console.log(`[Scheduler] --- Consumption noted [${new Date()}]---`)
          }
        } catch (e) {
          console.log(`[Scheduler] ERROR:`)
          console.log(e)
          console.log(`---------------------------------`)
        }
        
        // Wait 1 minute
        console.log('Wait next tick in 1m')
        await wait(MIN_MS)
        prevTime = now
      }
    } 
  }
}
