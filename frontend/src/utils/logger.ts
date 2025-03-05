/**
 * Logger utility for consistent logging throughout the frontend application
 * This replaces console.log statements in production code
 */

const NODE_ENV = import.meta.env.MODE || 'development';
const isProduction = NODE_ENV === 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // In production, only show warning and errors
    if (isProduction) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args);
    }
  }

  // For sensitive information that should be masked in logs
  secure(message: string, sensitiveData: any): void {
    if (this.shouldLog('info')) {
      const sanitized = typeof sensitiveData === 'string' 
        ? sensitiveData.replace(/./g, '*') 
        : '[SENSITIVE DATA REDACTED]';
      
      console.log(message, sanitized);
    }
  }
}

const logger = new Logger();
export default logger; 