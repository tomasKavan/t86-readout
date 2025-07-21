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
exports.ServiceEvent = exports.Type = void 0;
const typeorm_1 = require("typeorm");
const MeasPoint_1 = require("./MeasPoint");
const Readout_1 = require("./Readout");
var Type;
(function (Type) {
    Type["METER_REPLACEMENT"] = "metrep";
})(Type || (exports.Type = Type = {}));
let ServiceEvent = class ServiceEvent {
};
exports.ServiceEvent = ServiceEvent;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ServiceEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: Type }),
    __metadata("design:type", String)
], ServiceEvent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { precision: 0, nullable: true }),
    __metadata("design:type", Date)
], ServiceEvent.prototype, "occuredUTCTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MeasPoint_1.MeasPoint, mp => mp.serviceEvents),
    __metadata("design:type", MeasPoint_1.MeasPoint)
], ServiceEvent.prototype, "measPoint", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Readout_1.Readout, r => r.relatedServiceEvent),
    __metadata("design:type", Array)
], ServiceEvent.prototype, "corrections", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ServiceEvent.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], ServiceEvent.prototype, "oldValues", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], ServiceEvent.prototype, "newValues", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
    }),
    __metadata("design:type", Date)
], ServiceEvent.prototype, "createdUTCTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
        onUpdate: 'CURRENT_TIMESTAMP(0)'
    }),
    __metadata("design:type", Date)
], ServiceEvent.prototype, "updatedUTCTime", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'datetime',
        precision: 0
    }),
    __metadata("design:type", Date)
], ServiceEvent.prototype, "deletedUTCTime", void 0);
exports.ServiceEvent = ServiceEvent = __decorate([
    (0, typeorm_1.Entity)()
], ServiceEvent);
