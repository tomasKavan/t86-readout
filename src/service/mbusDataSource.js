"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureMbusDataSource;
const typeorm_1 = require("typeorm");
const MbusReadout_1 = require("./MbusReadout");
const models_1 = require("./models");
const Readout_1 = require("./models/Readout");
function configureMbusDataSource(config) {
    const mbus = new MbusReadout_1.MbusReadout(config);
    async function readout(db) {
        const mrep = db.manager.getRepository(models_1.Metric);
        const metrics = await mrep.find({
            where: {
                mbusValueRecordId: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
                autoReadoutEnabled: true
            },
            relations: {
                measPoint: true
            }
        });
        const list = [];
        for (const m of metrics) {
            let rsq = list.find(item => item.primaryAddress === m.measPoint.mbusAddr);
            if (!rsq) {
                rsq = {
                    primaryAddress: m.measPoint.mbusAddr,
                    serial: m.measPoint.mbusSerial,
                    records: []
                };
                list.push(rsq);
            }
            rsq.records.push({
                recordId: m.mbusValueRecordId,
                decimalShift: m.mbusDecimalShift
            });
        }
        const res = await mbus.readInputs(list);
        const readoutList = [];
        for (const slave of res) {
            for (const rec of slave.data) {
                const metric = metrics.find(m => {
                    return m.measPoint.mbusAddr === slave.query.primaryAddress
                        && m.mbusValueRecordId === rec.recordId;
                });
                if (!metric) {
                    // TODO: Log error and skip
                }
                const readout = new models_1.Readout();
                readout.metric = metric;
                readout.source = Readout_1.Source.MBUS;
                readout.meterUTCTimestamp = rec.timestamp;
                if (slave.error || rec.error) {
                    readout.type = Readout_1.Type.ERROR;
                    // TODO: process error into Readout entry
                }
                else {
                    readout.type = Readout_1.Type.READOUT;
                    readout.value = rec.value;
                }
                readoutList.push(readout);
            }
        }
        const rrep = db.manager.getRepository(models_1.Readout);
        await rrep.save(readoutList);
    }
    return {
        readout
    };
}
