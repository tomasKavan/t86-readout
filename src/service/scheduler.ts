import { logger } from "./logger"

export type SchedulerOptions = {
  fireOnEnable: boolean,
  offset: number,
  each: number
}

type Task = (runAt: Date) => Promise<any>

export class Scheduler {
  _config: SchedulerOptions
  _tasks: Task[] = []
  _timeoutId: any = undefined
  _enabled: boolean = false

  _isRunning: boolean = false
  _lastExecution: Date | null = null
  _nextExecution: Date | null = null
  _lastDuration: number | null = null

  constructor(config: SchedulerOptions) {
    this._config = config
  }

  get enabled(): boolean {
    return this._enabled
  }

  get offset(): number {
    return this._config.offset
  }

  get each(): number {
    return this._config.each
  }

  get isRunning(): boolean {
    return this._isRunning
  }

  get lastExecution(): Date | null {
    return this._lastExecution
  }

  get nextExecution(): Date | null {
    return this._nextExecution
  }

  get lastDurationMs(): number | null {
    return this._lastDuration
  }

  add(task: Task) {
    this._tasks.push(task)
  }

  enable(runOnEnable?: boolean) {
    if (this.enabled) return
    this._enabled = true

    if ((runOnEnable === undefined && this._config.fireOnEnable) || runOnEnable) {
      const asyncEnable = async () => {
        this._tick()
      }
      setTimeout(asyncEnable,1)
      return
    }

    this._scheduleNextTick()  
  }

  disable() {
    if (!this.enabled) return
    this._enabled = false
  }

  async executeOutOfOrder(wait: boolean = false) {
    if (this.isRunning) throw new Error('Can\'t execute whlie running')
    
    if (wait) {
      await this._exec()
      return
    } 

    this._exec()
  }

  private async _exec() {
    const d = new Date()
    if (this.isRunning) {
      logger.debug(`[scheduler] Can't execute tasks, execution already running (${d.getTime()})`)
      return
    } 

    this._isRunning = true
    
    logger.debug(`[scheduler] Executing tasks (${d.getTime()})`)

    const exec = async () => {
      for (const task of this._tasks) {
        await task(d)
      }

      this._isRunning = false
      this._lastDuration = (new Date()).getTime() - d.getTime()

      logger.debug(`[scheduler] Tasks finished (${d.getTime()})`)
    }
    await exec()
  }

  private _tick() {
    if (!this._enabled) return

    this._lastExecution = this._nextExecution
    this._scheduleNextTick()

    this._exec()
  }

  private _scheduleNextTick() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = undefined
    }

    if (!this.enabled) return

    // calc next tick ms
    const now = (new Date()).getTime()
    const n = Math.ceil((now - this.offset) / this.each)
    const next = this.offset + n * this.each
    const tickInMs = next - now

    this._nextExecution = new Date(now + tickInMs)

    this._timeoutId = setTimeout(this._tick.bind(this), tickInMs)
    logger.debug(`[scheduler] Next tick planned in (${tickInMs / 1000}s)`)
  }
}

export default function configureScheduler(config: SchedulerOptions) {
  return new Scheduler(config)
}