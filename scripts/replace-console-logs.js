#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const excludedDirs = ['node_modules', 'dist', 'build', 'coverage', '.git', 'scripts'];
const targetExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Keep track of statistics
let stats = {
  filesScanned: 0,
  filesModified: 0,
  statementsReplaced: 0
};

// Check if a file should be processed based on its extension
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return targetExtensions.includes(ext);
}

// Check if a directory should be skipped
function shouldSkipDirectory(dirPath) {
  const basename = path.basename(dirPath);
  return excludedDirs.includes(basename);
}

// Add the logger import to a file if it doesn't exist already
function addLoggerImport(content) {
  // Check if logger is already imported
  if (/import\s+.*\s+logger\s+.*\s+from/.test(content) || 
      /const\s+.*\s+logger\s+.*\s+=\s+require/.test(content)) {
    return content;
  }
  
  // Add the import statement at the top of the file
  // First find where imports end
  const lines = content.split('\n');
  let lastImportLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('require(')) {
      lastImportLine = i;
    } else if (lastImportLine !== -1 && lines[i].trim() !== '' && !lines[i].trim().startsWith('//')) {
      break;
    }
  }
  
  if (lastImportLine === -1) {
    // No imports found, add to the top
    return `import logger from '../utils/logger';\n\n${content}`;
  } else {
    // Add after the last import
    lines.splice(lastImportLine + 1, 0, "import logger from '../utils/logger';");
    return lines.join('\n');
  }
}

// Replace console.log statements in a file's content
function replaceConsoleStatements(filePath, content) {
  const relativePath = path.relative(rootDir, filePath);
  let modified = false;
  let replacements = 0;
  
  // Common replacements
  const replacementPatterns = [
    { regex: /console\.log\(/g, replacement: 'logger.info(' },
    { regex: /console\.error\(/g, replacement: 'logger.error(' },
    { regex: /console\.warn\(/g, replacement: 'logger.warn(' },
    { regex: /console\.info\(/g, replacement: 'logger.info(' },
    { regex: /console\.debug\(/g, replacement: 'logger.debug(' }
  ];
  
  // Perform replacements
  let modifiedContent = content;
  for (const pattern of replacementPatterns) {
    const matches = content.match(pattern.regex);
    if (matches && matches.length > 0) {
      replacements += matches.length;
      modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
      modified = true;
    }
  }
  
  // If any replacements were made, add the logger import
  if (modified) {
    modifiedContent = addLoggerImport(modifiedContent);
    console.log(chalk.green(`✓ Modified ${relativePath} (${replacements} replacements)`));
    stats.filesModified++;
    stats.statementsReplaced += replacements;
  }
  
  return { modified, content: modifiedContent };
}

// Process a single file
function processFile(filePath) {
  try {
    stats.filesScanned++;
    const content = fs.readFileSync(filePath, 'utf8');
    const { modified, content: modifiedContent } = replaceConsoleStatements(filePath, content);
    
    if (modified) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}: ${error.message}`));
  }
}

// Recursively process directories
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldSkipDirectory(fullPath)) {
          processDirectory(fullPath);
        }
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error processing directory ${dirPath}: ${error.message}`));
  }
}

// Ensure logger utility exists
function ensureLoggerUtilExists() {
  const loggerDir = path.join(rootDir, 'src', 'utils');
  const loggerPath = path.join(loggerDir, 'logger.ts');
  
  // Create utils directory if it doesn't exist
  if (!fs.existsSync(loggerDir)) {
    console.log(chalk.yellow(`Creating utils directory: ${loggerDir}`));
    fs.mkdirSync(loggerDir, { recursive: true });
  }
  
  // Check if logger.ts already exists
  if (!fs.existsSync(loggerPath)) {
    console.log(chalk.yellow(`Creating logger utility: ${loggerPath}`));
    
    const loggerContent = `/**
 * Logger utility for consistent logging throughout the application
 * This replaces console.log statements in production code
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
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
`;
    
    fs.writeFileSync(loggerPath, loggerContent, 'utf8');
    console.log(chalk.green('✓ Logger utility created successfully'));
  } else {
    console.log(chalk.green('✓ Logger utility already exists'));
  }
}

// Main function
function main() {
  console.log(chalk.bold.green('🔍 Console.log Replacement Tool 🔍'));
  
  // Ensure logger utility exists
  ensureLoggerUtilExists();
  
  // Process src directory first (backend)
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    console.log(chalk.bold('\n📋 Processing backend source files'));
    processDirectory(srcDir);
  }
  
  // Process frontend directory if it exists
  const frontendSrcDir = path.join(rootDir, 'frontend', 'src');
  if (fs.existsSync(frontendSrcDir)) {
    console.log(chalk.bold('\n📋 Processing frontend source files'));
    processDirectory(frontendSrcDir);
  }
  
  // Print summary
  console.log(chalk.bold.green('\n✅ Console.log replacement complete'));
  console.log(chalk.blue(`Files scanned: ${stats.filesScanned}`));
  console.log(chalk.blue(`Files modified: ${stats.filesModified}`));
  console.log(chalk.blue(`Statements replaced: ${stats.statementsReplaced}`));
  console.log(chalk.yellow('\nPlease run the deployment checklist again to verify the fixes:'));
  console.log(chalk.blue('node scripts/deployment-checklist.js'));
}

// Run the main function
main(); 