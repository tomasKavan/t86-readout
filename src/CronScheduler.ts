import cronParser from 'cron-parser'

export type CronSchedulerOptions<ParamsType> = {
  scheduleRefreshIntervalMs?: number,
  enable?: boolean,
  scheduleRefresh: () => Promise<CronSchedulerTask<ParamsType>[]>,
  task: (task: CronSchedulerTask<ParamsType>) => Promise<void>
}

export type CronSchedulerTask<ParamsType> = {
  id: string | number,
  cronUTCExpression: string,
  params?: ParamsType,
  isRunning?: boolean
}

const DEFAULT_SCHEDULE_INTERVAL_MS = 60 * 1000 // 1 minute
const CRON_INTERVAL_MS = 1000 // 1 second
const CRON_PARSE_OPTIONS = {
  utc: true
}

export class CronScheduler<ParamsType> {
  private _scheduleRefreshInterval: number = DEFAULT_SCHEDULE_INTERVAL_MS
  private _lastScheduleRefresh: number = 0
  private _scheduleQuery: () => Promise<CronSchedulerTask<ParamsType>[]>
  private _scheduledTasks: CronSchedulerTask<ParamsType>[] = []
  private _schedulingEnabled: boolean = false
  private _cronTickIntervalId: NodeJS.Timeout | null = null
  private _cronTask: (task: CronSchedulerTask<ParamsType>) => Promise<void>
  private _refreshingSchedulePromise: Promise<void> | null = null

  public get isEnabled(): boolean { return !!this._cronTickIntervalId }
  
  constructor(options?: CronSchedulerOptions<ParamsType>) {
    this._scheduleQuery = options.scheduleRefresh
    this._cronTask = options.task

    if (options.scheduleRefreshIntervalMs) {
      this._scheduleRefreshInterval = options.scheduleRefreshIntervalMs
    }

    if (options.enable) {
      this._schedulingEnabled = options.enable
    }
    if (this._schedulingEnabled) {
      this._schedulingEnabled = false
      this.enable()
    }
  }

  enable() {
    if (this._cronTickIntervalId) {
      return
    }
    this._cronTickIntervalId = setInterval(this._cronTick, CRON_INTERVAL_MS)
    console.log(`[CRON Scheduler] ENABLED`)
  }

  diasble() {
    if (!this._schedulingEnabled) {
      return
    }
    clearInterval(this._cronTickIntervalId)
    this._cronTickIntervalId = null
    console.log(`[CRON Scheduler] DISABLED`)
  }

  async _refreshScheduleCall() {
    try {
      const newSchedule = await this._scheduleQuery()
      const adding = newSchedule.filter(nsi => !this._scheduledTasks.find(sti => sti.id === nsi.id))
      const removing = this._scheduledTasks.filter(sti => !newSchedule.find(nti => nti.id === sti.id))
      const update = newSchedule.filter(nsi => {
        const a = this._scheduledTasks.find(sti => sti.id === nsi.id)
        return a && (a.cronUTCExpression !== nsi.cronUTCExpression || !deepEqual(a.params, nsi.params))
      })

      // Process adding
      for (const item of adding) {
        this._scheduledTasks.push(item)
        console.log(`[CRON Scheduler] ADD Task <${item.id}>`)
      }
      
      // Process removing
      for (const item of removing) {
        this._scheduledTasks.splice(this._scheduledTasks.findIndex(item => item.id === item.id), 1)
        console.log(`[CRON Scheduler] REMOVE Task <${item.id}>`)
      }

      // Process update
      for (const item of update) {
        const uItem = this._scheduledTasks.find(i => i.id === item.id)
        uItem.cronUTCExpression = item.cronUTCExpression
        uItem.params = item.params
        console.log(`[CRON Scheduler] UPDATE Task <${item.id}>`)
      }
    } catch (e) {
      console.log(`[CRON Scheduler] Unable to refresh schedule. Error: ${e}`)
    }

    this._refreshingSchedulePromise = null
  }

  async refreshSchedule() {
    if (this._refreshingSchedulePromise) {
      return this._refreshingSchedulePromise
    }

    this._refreshingSchedulePromise = this._refreshScheduleCall()
    return this._refreshingSchedulePromise
  }

  async _cronTick() {
    const now = (new Date()).getTime()
    
    // Refresh Schedule if needed
    if (now - this._lastScheduleRefresh > this._scheduleRefreshInterval) {
      await this.refreshSchedule()
    }

    // Iterate over scheduled tasks
    for (const task of this._scheduledTasks) {
      const interval = cronParser.parseExpression(task.cronUTCExpression, CRON_PARSE_OPTIONS)
      const nextExe = interval.next().getTime()

      if (Math.abs(nextExe - now) < 1000) {
        if (task.isRunning) {
          console.log(`[CRON Scheduler] SKIPPED Task <${task.id}>. Already running.`)
          continue
        }

        // Run
        (async () => {
          try {
            console.log(`[CRON Scheduler] START Task <${task.id}>.`)
            await this._cronTask(task)
            console.log(`[CRON Scheduler] END Task <${task.id}>.`)
          } catch (e) {
            console.log(`[CRON Scheduler] ERROR Task <${task.id}>. ${e}`)
          } finally {
            task.isRunning = false
          }
        })()

        task.isRunning = true

      }
    }
  }
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
          return false;
      }
  }

  return true;
}