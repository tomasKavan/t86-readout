"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceEvent = exports.Readout = exports.Metric = exports.MeasPoint = exports.modelsArray = void 0;
const MeasPoint_1 = require("./MeasPoint");
Object.defineProperty(exports, "MeasPoint", { enumerable: true, get: function () { return MeasPoint_1.MeasPoint; } });
const Metric_1 = require("./Metric");
Object.defineProperty(exports, "Metric", { enumerable: true, get: function () { return Metric_1.Metric; } });
const Readout_1 = require("./Readout");
Object.defineProperty(exports, "Readout", { enumerable: true, get: function () { return Readout_1.Readout; } });
const ServiceEvent_1 = require("./ServiceEvent");
Object.defineProperty(exports, "ServiceEvent", { enumerable: true, get: function () { return ServiceEvent_1.ServiceEvent; } });
const modelsArray = [
    MeasPoint_1.MeasPoint,
    Metric_1.Metric,
    Readout_1.Readout,
    ServiceEvent_1.ServiceEvent
];
exports.modelsArray = modelsArray;
