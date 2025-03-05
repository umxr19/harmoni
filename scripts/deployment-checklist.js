#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');
const chalk = require('chalk');
const exec = util.promisify(require('child_process').exec);

// Configuration
const isWindows = process.platform === 'win32';

// Helper function to log results
function logResult(message, success) {
  const icon = success ? '✓' : '✗';
  const color = success ? chalk.green : chalk.red;
  console.log(color(`${icon} ${message}`));
}

// Helper function for summary checkmarks
function checkMark(success) {
  return success ? chalk.green('✓') : chalk.red('✗');
}

// Check environment variables
function checkEnvVars() {
  console.log(chalk.bold('\n📋 Checking Environment Variables'));
  
  // Check backend .env file
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    logResult('.env file exists', false);
    return false;
  }
  logResult('.env file exists', true);
  
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {
    NODE_ENV: envContent.includes('NODE_ENV='),
    PORT: envContent.includes('PORT='),
    MONGODB_URI: envContent.includes('MONGODB_URI='),
    JWT_SECRET: envContent.includes('JWT_SECRET='),
    FRONTEND_URL: envContent.includes('FRONTEND_URL=')
  };
  
  // Check each required variable
  let allVarsPresent = true;
  for (const [varName, exists] of Object.entries(envVars)) {
    logResult(`${varName} is defined`, exists);
    if (!exists) allVarsPresent = false;
  }
  
  // Check frontend .env file
  const frontendEnvPath = path.join(process.cwd(), 'frontend', '.env');
  if (!fs.existsSync(frontendEnvPath)) {
    logResult('frontend/.env file exists', false);
    return false;
  }
  logResult('frontend/.env file exists', true);
  
  // Read frontend .env file
  const frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
  const frontendEnvVars = {
    VITE_API_URL: frontendEnvContent.includes('VITE_API_URL=')
  };
  
  // Check each required frontend variable
  for (const [varName, exists] of Object.entries(frontendEnvVars)) {
    logResult(`${varName} is defined in frontend/.env`, exists);
    if (!exists) allVarsPresent = false;
  }
  
  return allVarsPresent;
}

// Check for sensitive files in .gitignore
function checkSensitiveFiles() {
  console.log(chalk.bold('\n🔒 Checking for Sensitive Files'));
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    logResult('.gitignore file exists', false);
    return false;
  }
  logResult('.gitignore file exists', true);
  
  // Read .gitignore file
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredEntries = [
    '.env',
    'node_modules',
    'dist',
    'coverage',
    '.DS_Store'
  ];
  
  // Check each required entry
  let allEntriesPresent = true;
  for (const entry of requiredEntries) {
    const isIgnored = gitignoreContent.includes(entry);
    logResult(`${entry} is in .gitignore`, isIgnored);
    if (!isIgnored) allEntriesPresent = false;
  }
  
  return allEntriesPresent;
}

// Check build process
function checkBuild() {
  console.log(chalk.bold('\n🔨 Checking Build Process'));
  
  let buildSuccess = true;
  
  // Check TypeScript compilation
  console.log('Checking TypeScript compilation...');
  try {
    execSync('npm run build', { stdio: 'ignore' });
    logResult('Backend TypeScript compilation successful', true);
  } catch (error) {
    logResult('Backend TypeScript compilation successful', false);
    console.log(chalk.yellow(`TypeScript compilation error: ${error.message}`));
    buildSuccess = false;
  }
  
  // Check frontend build
  console.log('Checking frontend build...');
  try {
    execSync('cd frontend && npm run build', { stdio: 'ignore' });
    logResult('Frontend build successful', true);
  } catch (error) {
    logResult('Frontend build successful', false);
    console.log(chalk.yellow(`Frontend build error: ${error.message}`));
    buildSuccess = false;
  }
  
  return buildSuccess;
}

// Check for console.log statements in production code
async function checkConsoleLogs() {
  console.log(chalk.bold('\n🔍 Checking for console.log Statements'));
  
  try {
    const excludePatterns = [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.git',
      'scripts',
      'test',
      '__tests__',
      '__mocks__'
    ];
    
    // Use grep to find console.log statements, excluding test files and logger utility files
    const command = isWindows
      ? `powershell -Command "Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Where-Object { $_.FullName -notmatch 'node_modules|dist|build|coverage|\\.git|scripts|test|__tests__|__mocks__' -and $_.FullName -notmatch 'logger\\.ts$' } | Select-Object -ExpandProperty FullName | ForEach-Object { Select-String -Path $_ -Pattern 'console\\.(log|debug|info)\\(' | Select-Object -ExpandProperty Path,LineNumber,Line | ForEach-Object { \\"$($_.Path):$($_.LineNumber): $($_.Line)\\" } }"`
      : `grep -r --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build --exclude-dir=coverage --exclude-dir=.git --exclude-dir=scripts --exclude-dir=test --exclude-dir=__tests__ --exclude-dir=__mocks__ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -n "console\\.(log|debug|info)(" . | grep -v "logger.ts"`;
    
    const { stdout } = await exec(command);
    const consoleLogStatements = stdout.trim().split('\n').filter(line => line.trim() !== '');
    
    if (consoleLogStatements.length === 0 || (consoleLogStatements.length === 1 && consoleLogStatements[0] === '')) {
      logResult('No console.log statements found in production code', true);
      return true;
    } else {
      logResult('No console.log statements found in production code', false);
      console.log(chalk.yellow(`Found ${consoleLogStatements.length} console.log statements:`));
      consoleLogStatements.forEach(line => console.log(chalk.yellow(`- ${line}`)));
      return false;
    }
  } catch (error) {
    // If grep doesn't find any matches, it returns exit code 1
    if (error.code === 1 && !error.stdout.trim()) {
      logResult('No console.log statements found in production code', true);
      return true;
    }
    
    console.error(chalk.red('Error checking for console.log statements:'), error.message);
    console.log(chalk.yellow('Please check for console.log statements manually before deploying.'));
    return false;
  }
}

// Check API URL configuration
function checkApiUrl() {
  console.log(chalk.bold('\n🌐 Checking API URL Configuration'));
  
  const frontendEnvPath = path.join(process.cwd(), 'frontend', '.env');
  if (!fs.existsSync(frontendEnvPath)) {
    logResult('Frontend API URL is set', false);
    return false;
  }
  
  const frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
  const apiUrlSet = frontendEnvContent.includes('VITE_API_URL=');
  
  logResult('Frontend API URL is set', apiUrlSet);
  return apiUrlSet;
}

// Check database connection
function checkDatabaseConnection() {
  console.log(chalk.bold('\n🗄️ Checking Database Connection'));
  
  try {
    execSync('node scripts/test-db-connection.js', { stdio: 'ignore' });
    logResult('Database connection successful', true);
    return true;
  } catch (error) {
    logResult('Database connection successful', false);
    console.log(chalk.yellow(`Database connection error: ${error.message}`));
    return false;
  }
}

// Main function
async function main() {
  console.log(chalk.bold.green('🚀 DEPLOYMENT READINESS CHECKLIST 🚀'));
  
  // Run all checks
  const envVarsResult = checkEnvVars();
  const sensitiveFilesResult = checkSensitiveFiles();
  const buildResult = checkBuild();
  const consoleLogsResult = await checkConsoleLogs();
  const apiUrlResult = checkApiUrl();
  const databaseResult = checkDatabaseConnection();
  
  // Summarize results
  console.log(chalk.bold('\n📊 Summary'));
  console.log(`${checkMark(envVarsResult)} envVars`);
  console.log(`${checkMark(sensitiveFilesResult)} sensitiveFiles`);
  console.log(`${checkMark(buildResult)} build`);
  console.log(`${checkMark(consoleLogsResult)} consoleLogs`);
  console.log(`${checkMark(apiUrlResult)} apiUrl`);
  console.log(`${checkMark(databaseResult)} database`);
  
  const allPassed = envVarsResult && sensitiveFilesResult && buildResult && 
                    consoleLogsResult && apiUrlResult && databaseResult;
  
  if (allPassed) {
    console.log(chalk.bold.green('\n✅ All checks passed! You are ready to deploy.'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n❌ Some checks failed. Please fix the issues before deploying.'));
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Error running deployment checklist:'), error);
  process.exit(1);
}); 