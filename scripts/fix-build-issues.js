#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Check if a package.json file exists at the given path
function hasPackageJson(dirPath) {
  return fs.existsSync(path.join(dirPath, 'package.json'));
}

// Check if a tsconfig.json file exists at the given path
function hasTsConfig(dirPath) {
  return fs.existsSync(path.join(dirPath, 'tsconfig.json'));
}

// Install dependencies in a directory
function installDependencies(dirPath) {
  console.log(chalk.yellow(`Installing dependencies in ${dirPath}...`));
  
  try {
    // Try to use npm ci first for exact installation
    console.log(chalk.blue('Running npm ci...'));
    execSync('npm ci', { cwd: dirPath, stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.yellow('npm ci failed, falling back to npm install...'));
    
    try {
      // Fall back to npm install
      execSync('npm install', { cwd: dirPath, stdio: 'inherit' });
    } catch (installError) {
      console.error(chalk.red(`Failed to install dependencies in ${dirPath}`));
      console.error(chalk.red(installError.message));
      process.exit(1);
    }
  }
  
  console.log(chalk.green(`Successfully installed dependencies in ${dirPath}`));
}

// Fix common TypeScript errors
function fixTsConfig(dirPath) {
  const tsconfigPath = path.join(dirPath, 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    console.log(chalk.yellow(`No tsconfig.json found in ${dirPath}, skipping...`));
    return;
  }
  
  try {
    console.log(chalk.blue(`Checking tsconfig.json in ${dirPath}...`));
    
    // Read the tsconfig.json file
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    let modified = false;
    
    // Add missing configurations that are commonly needed
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
      modified = true;
    }
    
    // Set module resolution to Node.js style
    if (!tsconfig.compilerOptions.moduleResolution) {
      tsconfig.compilerOptions.moduleResolution = 'node';
      modified = true;
    }
    
    // Allow JavaScript files
    if (tsconfig.compilerOptions.allowJs === undefined) {
      tsconfig.compilerOptions.allowJs = true;
      modified = true;
    }
    
    // Enable esModuleInterop for better CommonJS/ES module compatibility
    if (!tsconfig.compilerOptions.esModuleInterop) {
      tsconfig.compilerOptions.esModuleInterop = true;
      modified = true;
    }
    
    // Save the modified tsconfig.json file
    if (modified) {
      console.log(chalk.yellow(`Updating tsconfig.json in ${dirPath}...`));
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2), 'utf8');
      console.log(chalk.green(`Successfully updated tsconfig.json in ${dirPath}`));
    } else {
      console.log(chalk.green(`No updates needed for tsconfig.json in ${dirPath}`));
    }
  } catch (error) {
    console.error(chalk.red(`Failed to fix tsconfig.json in ${dirPath}`));
    console.error(chalk.red(error.message));
  }
}

// Check if typescript is installed
function ensureTypeScriptInstalled(dirPath) {
  try {
    console.log(chalk.blue(`Checking TypeScript installation in ${dirPath}...`));
    
    const packageJsonPath = path.join(dirPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if TypeScript is in dependencies or devDependencies
    const hasTypeScriptDep = 
      (packageJson.dependencies && packageJson.dependencies.typescript) || 
      (packageJson.devDependencies && packageJson.devDependencies.typescript);
    
    if (!hasTypeScriptDep) {
      console.log(chalk.yellow(`TypeScript not found in ${dirPath}, installing...`));
      execSync('npm install --save-dev typescript', { cwd: dirPath, stdio: 'inherit' });
      console.log(chalk.green(`Successfully installed TypeScript in ${dirPath}`));
    } else {
      console.log(chalk.green(`TypeScript is already installed in ${dirPath}`));
    }
  } catch (error) {
    console.error(chalk.red(`Failed to check/install TypeScript in ${dirPath}`));
    console.error(chalk.red(error.message));
  }
}

// Try to build the project
function tryBuild(dirPath) {
  console.log(chalk.yellow(`Attempting to build ${dirPath}...`));
  
  try {
    execSync('npm run build', { cwd: dirPath, stdio: 'inherit' });
    console.log(chalk.green(`Successfully built ${dirPath}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to build ${dirPath}`));
    console.error(chalk.red(error.message));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.bold.green('🔧 Build Issue Fixer 🔧'));
  
  // Root directory fixes
  if (hasPackageJson('.')) {
    console.log(chalk.bold('\n📋 Fixing Backend Build Issues'));
    installDependencies('.');
    ensureTypeScriptInstalled('.');
    if (hasTsConfig('.')) {
      fixTsConfig('.');
    }
    tryBuild('.');
  }
  
  // Frontend directory fixes
  if (hasPackageJson('frontend')) {
    console.log(chalk.bold('\n📋 Fixing Frontend Build Issues'));
    installDependencies('frontend');
    ensureTypeScriptInstalled('frontend');
    if (hasTsConfig('frontend')) {
      fixTsConfig('frontend');
    }
    tryBuild('frontend');
  }
  
  console.log(chalk.bold.green('\n✅ Build issue fixing complete'));
  console.log(chalk.yellow('Please run the deployment checklist again to verify the fixes:'));
  console.log(chalk.blue('node scripts/deployment-checklist.js'));
}

// Run the main function
main(); 