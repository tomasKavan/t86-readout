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
exports.MeasPoint = exports.Subject = void 0;
const typeorm_1 = require("typeorm");
const Metric_1 = require("./Metric");
const ServiceEvent_1 = require("./ServiceEvent");
var Subject;
(function (Subject) {
    Subject["ELECTRICITY"] = "ele";
    Subject["GAS_FUEL"] = "gas";
    Subject["WATER"] = "wat";
    Subject["HEAT"] = "hth";
    Subject["ENVIRONMENT"] = "env";
    Subject["CLEANING"] = "cln";
})(Subject || (exports.Subject = Subject = {}));
var SubjectSpec;
(function (SubjectSpec) {
    SubjectSpec["COLD"] = "cold";
    SubjectSpec["HOT"] = "hot";
})(SubjectSpec || (SubjectSpec = {}));
let MeasPoint = class MeasPoint {
};
exports.MeasPoint = MeasPoint;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 16 }),
    __metadata("design:type", String)
], MeasPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], MeasPoint.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 8 }),
    __metadata("design:type", String)
], MeasPoint.prototype, "roomNo", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], MeasPoint.prototype, "instDetails", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], MeasPoint.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: Subject }),
    __metadata("design:type", String)
], MeasPoint.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: SubjectSpec }),
    __metadata("design:type", String)
], MeasPoint.prototype, "subjectSpec", void 0);
__decorate([
    (0, typeorm_1.Column)('smallint'),
    __metadata("design:type", Number)
], MeasPoint.prototype, "mbusAddr", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], MeasPoint.prototype, "mbusSerial", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Metric_1.Metric, m => m.measPoint),
    __metadata("design:type", Array)
], MeasPoint.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ServiceEvent_1.ServiceEvent, se => se.measPoint),
    __metadata("design:type", Array)
], MeasPoint.prototype, "serviceEvents", void 0);
exports.MeasPoint = MeasPoint = __decorate([
    (0, typeorm_1.Entity)()
], MeasPoint);
