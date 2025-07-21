"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const config_1 = __importDefault(require("./config"));
const dbDataSource_1 = __importDefault(require("./dbDataSource"));
const mbusDataSource_1 = __importDefault(require("./mbusDataSource"));
const scheduler_1 = __importDefault(require("./scheduler"));
const db = (0, dbDataSource_1.default)(config_1.default.db);
const mbus = (0, mbusDataSource_1.default)(config_1.default.mbus);
const scheduler = (0, scheduler_1.default)(config_1.default.scheduler);
db.initialize()
    .then(async () => {
    // Set Timezone to UTC - All dates in DB are stored as UTC!!!
    await db.manager.query('SET @@session.time_zone = \'+00:00\';');
    console.log(`[index:DataSource] initialized`);
    // Run readout scheduler
    scheduler.add(async () => {
        await mbus.readout(db);
    });
    console.log(`[index:Readout] Scheduling enabled`);
})
    .catch((error) => console.log(error));
