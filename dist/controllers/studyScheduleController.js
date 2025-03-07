"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyScheduleController = void 0;
const studyScheduleService_1 = require("../services/studyScheduleService");
const catchAsync_1 = require("../utils/catchAsync");
exports.studyScheduleController = {
    getWeeklySchedule: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const schedule = yield studyScheduleService_1.studyScheduleService.generateWeeklySchedule(req.user);
        res.status(200).json({
            success: true,
            data: schedule
        });
    })),
    invalidateSchedule: (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        yield studyScheduleService_1.studyScheduleService.invalidateScheduleCache(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Schedule cache invalidated successfully'
        });
    })),
    // Additional endpoints can be added here for:
    // - Updating study preferences
    // - Marking topics as completed
    // - Getting study history
    // - etc.
};
