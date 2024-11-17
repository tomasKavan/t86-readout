export type CronSchedulerOptions = {
  scheduleInterval?: number,
  enable?: boolean,
  onTaskScheduled: () => void,
  onTaskRemoved: () => void,
  onTaskBeforeRun: (cst: CronSchedulerTask) => Promise<void>,
  onTaskAfterRun: (cst: CronSchedulerTask) => void
}

export type CronSchedulerTask = {
  cronUTCExpression: string,
  task: () => Promise<void>,
  cleanup?: () => Promise<void>
}

const DEFAULT_SCHEDULE_INTERVAL_MS = 60 * 1000 // 1 minute

export class CronScheduler {
  private _query: () => Promise<CronSchedulerTask[]>
  private _scheduledTasks: CronSchedulerTask[]
  private _schedulingEnabled: boolean
  
  constructor(query, options?: CronScheduler) {
    this._query = query
    this._schedulingEnabled = false
    this._scheduledTasks = []
  }

  enable() {

  }

  diasble() {

  }

  schedule() {

  }

}