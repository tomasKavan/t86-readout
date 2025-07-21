"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureScheduler;
class Scheduler {
    constructor(config) {
        this._tasks = [];
        this._enabled = false;
        this._intervalId = undefined;
        this._config = config;
    }
    get enabled() {
        return this._enabled;
    }
    get offset() {
        return this._config.offset;
    }
    get each() {
        return this._config.each;
    }
    add(task) {
        this._tasks.push(task);
    }
    enable() {
        if (this._enabled)
            return;
    }
    disable() {
        if (!this._enabled)
            return;
    }
}
function configureScheduler(config) {
    return new Scheduler(config);
}
