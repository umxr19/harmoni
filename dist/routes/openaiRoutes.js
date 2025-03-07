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
const express_1 = require("express");
const openaiController_1 = require("../controllers/openaiController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authMiddleware);
// Tutor endpoint
router.post('/tutor', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const { question, context } = req.body;
        const response = yield openaiController_1.openaiController.getTutorResponse(question, context, req.user.id);
        res.json({
            success: true,
            response: response
        });
    }
    catch (error) {
        console.error('Error in tutor endpoint:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
})));
// Study schedule generation endpoint
router.post('/study-schedule', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const schedule = yield openaiController_1.openaiController.generateStudySchedule(req.body, req.user);
        res.json({
            success: true,
            response: schedule
        });
    }
    catch (error) {
        console.error('Error in study schedule endpoint:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
})));
exports.default = router;
