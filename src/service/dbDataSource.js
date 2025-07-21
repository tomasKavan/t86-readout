"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureDataSource;
const typeorm_1 = require("typeorm");
const index_1 = require("./models/index");
function configureDataSource(config) {
    return new typeorm_1.DataSource({
        type: 'mysql',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.pass,
        database: config.name,
        entities: index_1.modelsArray,
        synchronize: true,
        logging: config.logging,
        // Set TypeORM DB <-> JS Date parsion to UTC. All dates in DB are stored as UTC!!!
        timezone: 'Z'
    });
}
