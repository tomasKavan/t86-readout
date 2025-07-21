"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metric = exports.Unit = exports.Func = exports.MetricType = void 0;
exports.unitForMetric = unitForMetric;
const typeorm_1 = require("typeorm");
const MeasPoint_1 = require("./MeasPoint");
const Readout_1 = require("./Readout");
var MetricType;
(function (MetricType) {
    MetricType["CONSUMPTION"] = "cons";
    MetricType["TIME_ELAPSED"] = "tel";
})(MetricType || (exports.MetricType = MetricType = {}));
var Func;
(function (Func) {
    Func["INST"] = "inst";
    Func["SUM"] = "sum";
})(Func || (exports.Func = Func = {}));
var Unit;
(function (Unit) {
    Unit["LITER"] = "l";
    Unit["WATT_HOUR"] = "wh";
    Unit["SECOND"] = "s";
})(Unit || (exports.Unit = Unit = {}));
const unitMatrix = {
    [MeasPoint_1.Subject.ELECTRICITY]: {
        [MetricType.CONSUMPTION]: Unit.WATT_HOUR
    },
    [MeasPoint_1.Subject.GAS_FUEL]: {
        [MetricType.CONSUMPTION]: Unit.LITER
    },
    [MeasPoint_1.Subject.WATER]: {
        [MetricType.CONSUMPTION]: Unit.LITER
    },
    [MeasPoint_1.Subject.HEAT]: {
        [MetricType.CONSUMPTION]: Unit.WATT_HOUR
    },
    [MeasPoint_1.Subject.CLEANING]: {
        [MetricType.TIME_ELAPSED]: Unit.SECOND
    }
};
function unitForMetric(metric) {
    return unitMatrix[metric.measPoint.subject]?.[metric.type];
}
// TODO: Unique - measPoint + mbusValueRecordId
let Metric = class Metric {
};
exports.Metric = Metric;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Metric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => MeasPoint_1.MeasPoint, mp => mp.metrics),
    __metadata("design:type", MeasPoint_1.MeasPoint)
], Metric.prototype, "measPoint", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: MetricType }),
    __metadata("design:type", String)
], Metric.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: Func }),
    __metadata("design:type", String)
], Metric.prototype, "func", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], Metric.prototype, "hasPhysicalDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], Metric.prototype, "autoReadoutEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], Metric.prototype, "mbusValueRecordId", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], Metric.prototype, "mbusDecimalShift", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Readout_1.Readout, r => r.metric),
    __metadata("design:type", Array)
], Metric.prototype, "readouts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
    }),
    __metadata("design:type", Date)
], Metric.prototype, "createdUTCTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
        onUpdate: 'CURRENT_TIMESTAMP(0)'
    }),
    __metadata("design:type", Date)
], Metric.prototype, "updatedUTCTime", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'datetime',
        precision: 0
    }),
    __metadata("design:type", Date)
], Metric.prototype, "deletedUTCTime", void 0);
exports.Metric = Metric = __decorate([
    (0, typeorm_1.Entity)()
], Metric);
