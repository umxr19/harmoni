"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * A simple wrapper around jwt.sign to avoid TypeScript's type checking
 */
function signToken(payload, secret, options) {
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
