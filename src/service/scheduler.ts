import { logger } from "./logger"

export type SchedulerOptions = {
  offset: number,
  each: number
}

type Task = (runAt: Date) => Promise<any>

class Scheduler {
  _config: SchedulerOptions
  _tasks: Task[] = []
  _intervalId: any = undefined

  constructor(config: SchedulerOptions) {
    this._config = config
  }

  get enabled(): boolean {
    return !!this._intervalId
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

    if (runOnEnable) {
      this._tick()
    }
    this._intervalId = setInterval(this._tick.bind(this), this.each)
  }

  disable() {
    if (!this.enabled) return

    clearInterval(this._intervalId)
    this._intervalId = undefined
  }

  private _tick() {
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
}

export default function configureScheduler(config: SchedulerOptions) {
  return new Scheduler(config)
}