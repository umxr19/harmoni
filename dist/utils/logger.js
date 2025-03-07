"use strict";
/**
 * Logger utility for consistent logging throughout the application
 * This replaces console.log statements in production code
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
class Logger {
    shouldLog(level) {
        // In production, only show warning and errors
        if (isProduction) {
            return level === 'warn' || level === 'error';
        }
        return true;
    }
    info(...args) {
        if (this.shouldLog('info')) {
            console.log(...args);
        }
    }
    warn(...args) {
        if (this.shouldLog('warn')) {
            console.warn(...args);
        }
    }
    error(...args) {
        if (this.shouldLog('error')) {
            console.error(...args);
        }
    }
    debug(...args) {
        if (this.shouldLog('debug')) {
            console.debug(...args);
        }
    }
    // For sensitive information that should be masked in logs
    secure(message, sensitiveData) {
        if (this.shouldLog('info')) {
            const sanitized = typeof sensitiveData === 'string'
                ? sensitiveData.replace(/./g, '*')
                : '[SENSITIVE DATA REDACTED]';
            console.log(message, sanitized);
        }
    }
}
const logger = new Logger();
exports.default = logger;
