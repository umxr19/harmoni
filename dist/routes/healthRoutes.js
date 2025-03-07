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
const redisService_1 = require("../services/redisService");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redisHealth = yield redisService_1.redisService.healthCheck();
        res.json({
            status: 'ok',
            redis: {
                status: redisHealth ? 'healthy' : 'unhealthy'
            }
        });
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed'
        });
    }
}));
exports.default = router;
