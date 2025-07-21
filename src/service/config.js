"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'readout',
        pass: process.env.DB_PASS || 'oh.G.read.4',
        name: process.env.DB_NAME || 'readout2',
        logging: processLoggerOptions(process.env.DB_LOGLEVEL)
    },
    mbus: {
        host: process.env.MBUS_HOST || '127.0.0.1',
        port: parseInt(process.env.MBUS_PORT) || 1234,
        timeout: parseInt(process.env.MBUS_TIMEOUT_MS) || 4000
    },
    scheduler: {
        offset: parseInt(process.env.SCHEDULE_OFFSET_MS) || 0,
        each: parseInt(process.env.SCHEDULE_EACH_MS) || 900000 // Default each 15 minutes
    }
};
exports.default = config;
function processLoggerOptions(envOpts) {
    const levels = ["query", "schema", "error", "warn", "info", "log", "migration"];
    if (!envOpts) {
        return false;
    }
    if (envOpts === 'true') {
        return true;
    }
    if (envOpts === 'all') {
        return 'all';
    }
    return envOpts.split(':').filter(item => levels.includes(item));
}
function booleanFromEnv(envOpt) {
    return envOpt && (envOpt.toLowerCase() === 'true' || envOpt === '1');
}
