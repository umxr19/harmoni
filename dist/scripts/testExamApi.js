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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const testApi = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Testing /api/exams endpoint...');
        const response1 = yield axios_1.default.get('http://localhost:3001/api/exams');
        logger_1.default.info('Response:', response1.data);
        logger_1.default.info('\nTesting /api/exams/public endpoint...');
        const response2 = yield axios_1.default.get('http://localhost:3001/api/exams/public');
        logger_1.default.info('Response:', response2.data);
    }
    catch (error) {
        logger_1.default.error('API test failed:', error instanceof Error ? error.message : String(error));
        if (error && typeof error === 'object' && 'response' in error) {
            logger_1.default.error('Status:', error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response ? error.response.status : 'unknown');
            logger_1.default.error('Data:', error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response ? error.response.data : 'unknown');
        }
    }
});
testApi();
