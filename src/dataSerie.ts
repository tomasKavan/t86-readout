import { DataSource } from "typeorm"
import { CronScheduler, CronSchedulerTask } from "./CronScheduler"
import { DataSeries } from "./models"

export type DataSeriesConfigOptions = {
  processOnMinute: number,
  onStart: boolean
}

const PROCESSING_INTERVAL_MS = 1000 * 60 * 15 // 15 minutes

export default function DataSeriesScheduler(dataSource: DataSource, config: DataSeriesConfigOptions) {
  let timeoutId = null
  let runningPromise: Promise<void> | null = null

  function enable() {
    if (timeoutId) {
      return
    }

    const now = new Date()
    const timeoutIntervalMs = nextRunIn(now, config.processOnMinute) 

    timeoutId = setTimeout(processDataSeries, timeoutIntervalMs)
  }

  function disable() {
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    timeoutId = null
  }

  async function processDataSeries() {
    if (runningPromise) {
      return runningPromise
    }

    runningPromise = _callProcessDataSeries()
    return runningPromise
  }

  async function _callProcessDataSeries() {
    

    runningPromise = null
  }

  return {
    enable,
    disable
  }

}

function nextRunIn(now: Date, minute: number): number {

}