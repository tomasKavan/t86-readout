"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MbusReadout = exports.MbusError = exports.ErrCode = void 0;
const MbusMasterDef = __importStar(require("node-mbus"));
const MbusMaster = MbusMasterDef.default;
var State;
(function (State) {
    State["Disconnected"] = "disconnected";
    State["Connecting"] = "connecting";
    State["Connected"] = "connected";
    State["Disconnecting"] = "disconnecting";
})(State || (State = {}));
var ErrCode;
(function (ErrCode) {
    ErrCode[ErrCode["E_MBUS_CONNECTION"] = 0] = "E_MBUS_CONNECTION";
    ErrCode[ErrCode["E_MBUS_SLAVE_READ"] = 1] = "E_MBUS_SLAVE_READ";
    ErrCode[ErrCode["E_MBUS_SERIAL_MISMATCH"] = 2] = "E_MBUS_SERIAL_MISMATCH";
})(ErrCode || (exports.ErrCode = ErrCode = {}));
class MbusError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.MbusError = MbusError;
class MbusReadout {
    get state() { return this._state; }
    constructor(config) {
        this._state = State.Disconnected;
        this._config = config;
        this._mbusMaster = new MbusMaster(config);
    }
    async connect() {
        if (this.state === State.Connected) {
            return;
        }
        if (this.state !== State.Disconnected) {
            throw new Error(`[Readout] Can't connect in state ${this.state}`);
        }
        return new Promise((resolve, reject) => {
            this._state = State.Connecting;
            this._mbusMaster.connect((err) => {
                if (err) {
                    this._state = State.Disconnected;
                    reject(err);
                    return;
                }
                this._state = State.Connected;
                resolve();
            });
        });
    }
    async close() {
        if (this.state === State.Disconnected) {
            return;
        }
        if (this.state !== State.Connected) {
            throw new Error(`[Readout] Can't close in state ${this.state}`);
        }
        return new Promise((resolve, reject) => {
            this._state = State.Connecting;
            this._mbusMaster.close((err) => {
                if (err) {
                    this._state = State.Connected;
                    reject(err);
                    return;
                }
                this._state = State.Disconnected;
                resolve();
            });
        });
    }
    async readInputs(list) {
        const dataList = [];
        for (const q of list) {
            const outAddr = {
                query: q,
                data: new Array()
            };
            dataList.push(outAddr);
            let rawData = undefined;
            let error = undefined;
            try {
                rawData = await this.readAddress(q.primaryAddress);
            }
            catch (e) {
                error = new MbusError(ErrCode.E_MBUS_CONNECTION, e.message);
            }
            if (!error) {
                if (rawData.SlaveInformation.Id !== q.serial) {
                    error = new MbusError(ErrCode.E_MBUS_SERIAL_MISMATCH, `[MBusReader] Primary ${q.primaryAddress}: Meter S/N ${rawData.SlaveInformation.Id} doesn't match S/N ${q.serial} in DB`);
                }
            }
            // Get records
            for (const qRec of q.records) {
                if (error) {
                    outAddr.data.push({
                        recordId: qRec.recordId,
                        error: error
                    });
                    continue;
                }
                const rec = rawData.DataRecord.find(item => {
                    return item.id === qRec.recordId;
                });
                if (!rec) {
                    outAddr.data.push({
                        recordId: qRec.recordId,
                        error: new MbusError(ErrCode.E_MBUS_SLAVE_READ, `[MBusReader] Primary ${q.primaryAddress}: Record id ${qRec.recordId} not found on readout`)
                    });
                    continue;
                }
                const value = rec.Value * Math.pow(10, (qRec.decimalShift || 0));
                const outRec = {
                    recordId: rec.id,
                    function: rec.Function,
                    unit: rec.Unit,
                    value: value,
                    originalValue: rec.Value,
                    timestamp: new Date(rec.Timestamp)
                };
                outAddr.data.push(outRec);
            }
        }
        return dataList;
    }
    async readAddress(primary) {
        if (primary < 0 || primary > 252) {
            throw new Error(`[MBusReader] Can't read meter on address ${primary}. Out of range <0;252>.`);
        }
        if (this.state !== State.Connected) {
            throw new Error(`[MBusReader] Can't read meter on address ${primary}. Bus is not connected.`);
        }
        return new Promise((resolve, reject) => {
            this._mbusMaster.getData(primary, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }
}
exports.MbusReadout = MbusReadout;
