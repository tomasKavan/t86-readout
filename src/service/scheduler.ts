import { logger } from "./logger"

export type SchedulerOptions = {
  fireOnEnable: boolean,
  offset: number,
  each: number
}

type Task = (runAt: Date) => Promise<any>

class Scheduler {
  _config: SchedulerOptions
  _tasks: Task[] = []
  _timeoutId: any = undefined
  _enabled: boolean = false

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

  private _tick() {
    if (!this._enabled) return

    this._scheduleNextTick()

    const d = new Date()
    logger.debug(`[scheduler] Executing tasks (${d.getTime()})`)
    const exec = async () => {
      for (const task of this._tasks) {
        await task(d)
      }
      logger.debug(`[scheduler] Tasks finished (${d.getTime()})`)
    }
    exec()
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

    this._timeoutId = setTimeout(this._tick.bind(this), tickInMs)
    logger.debug(`[scheduler] Next tick planned in (${tickInMs / 1000}s)`)
  }
}

export default function configureScheduler(config: SchedulerOptions) {
  return new Scheduler(config)
}