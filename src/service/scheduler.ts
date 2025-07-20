export type SchedulerOptions = {
  offset: number,
  each: number
}

type Task = () => Promise<any>

class Scheduler {
  _config: SchedulerOptions
  _tasks: Task[] = []
  _enabled: boolean = false
  _intervalId: any = undefined

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

  enable() {
    if (this._enabled) return
  }

  disable() {
    if (!this._enabled) return
  }
}

export default function configureScheduler(config: SchedulerOptions) {
  return new Scheduler(config)
}