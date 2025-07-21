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
exports.Readout = exports.Source = exports.Type = void 0;
const typeorm_1 = require("typeorm");
const Metric_1 = require("./Metric");
const ServiceEvent_1 = require("./ServiceEvent");
var Type;
(function (Type) {
    Type["READOUT"] = "rout";
    Type["CORRECTION"] = "corr";
    Type["ERROR"] = "err";
})(Type || (exports.Type = Type = {}));
var Source;
(function (Source) {
    Source["MBUS"] = "mbus";
    Source["MANUAL"] = "man";
})(Source || (exports.Source = Source = {}));
var ErrCode;
(function (ErrCode) {
    ErrCode[ErrCode["E_MBUS_CONNECTION"] = 0] = "E_MBUS_CONNECTION";
    ErrCode[ErrCode["E_MBUS_SLAVE_READ"] = 1] = "E_MBUS_SLAVE_READ";
    ErrCode[ErrCode["E_MBUS_SERIAL_MISMATCH"] = 2] = "E_MBUS_SERIAL_MISMATCH";
})(ErrCode || (ErrCode = {}));
let Readout = class Readout {
};
exports.Readout = Readout;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Readout.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Metric_1.Metric, m => m.readouts),
    __metadata("design:type", Metric_1.Metric)
], Readout.prototype, "metric", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: Type }),
    __metadata("design:type", String)
], Readout.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: Source }),
    __metadata("design:type", String)
], Readout.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", Number)
], Readout.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { nullable: true }),
    __metadata("design:type", Number)
], Readout.prototype, "errCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", String)
], Readout.prototype, "errDetail", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceEvent_1.ServiceEvent, se => se.corrections, { nullable: true }),
    __metadata("design:type", ServiceEvent_1.ServiceEvent)
], Readout.prototype, "relatedServiceEvent", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { precision: 0, nullable: true }),
    __metadata("design:type", Date)
], Readout.prototype, "meterUTCTimestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
    }),
    __metadata("design:type", Date)
], Readout.prototype, "createdUTCTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
        onUpdate: 'CURRENT_TIMESTAMP(0)'
    }),
    __metadata("design:type", Date)
], Readout.prototype, "updatedUTCTime", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'datetime',
        precision: 0
    }),
    __metadata("design:type", Date)
], Readout.prototype, "deletedUTCTime", void 0);
exports.Readout = Readout = __decorate([
    (0, typeorm_1.Entity)()
], Readout);
