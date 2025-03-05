#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const rootDir = path.resolve(__dirname, '..');

// Files with console.log statements to fix
const filesToFix = [
  'src/config/database.ts',
  'src/controllers/authController.ts',
  'src/controllers/questionController.ts',
  'src/controllers/userController.ts',
  'src/index.ts',
  'src/middleware/errorHandler.ts',
  'src/routes/authRoutes.ts',
  'src/routes/examRoutes.ts',
  'src/routes/questionRoutes.ts',
  'src/routes/userRoutes.ts',
  'src/scripts/testExamApi.ts',
  'src/services/authService.ts',
  'src/services/classroomService.ts',
  'src/services/examService.ts',
  'src/services/questionService.ts',
  'src/services/userService.ts',
  'src/utils/validation.ts'
];

// Keep track of statistics
let stats = {
  filesScanned: 0,
  filesModified: 0,
  statementsReplaced: 0
};

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
    const fullPath = path.join(rootDir, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`File not found: ${filePath}`));
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const { modified, content: modifiedContent } = replaceConsoleStatements(fullPath, content);
    
    if (modified) {
      fs.writeFileSync(fullPath, modifiedContent, 'utf8');
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}: ${error.message}`));
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
  console.log(chalk.bold.green('🔍 Console.log Replacement Tool (Targeted) 🔍'));
  
  // Ensure logger utility exists
  ensureLoggerUtilExists();
  
  // Process each file in the list
  console.log(chalk.bold('\n📋 Processing specified files'));
  for (const filePath of filesToFix) {
    processFile(filePath);
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