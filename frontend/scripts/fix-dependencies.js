/**
 * This script helps identify and fix React dependency issues
 * Run with: node scripts/fix-dependencies.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}React Dependency Fixer${colors.reset}`);
console.log(`${colors.cyan}====================${colors.reset}`);

// Check if we're in the frontend directory
const frontendDir = path.dirname(__dirname);
const isInFrontend = fs.existsSync(path.join(frontendDir, 'package.json')) &&
  JSON.parse(fs.readFileSync(path.join(frontendDir, 'package.json'), 'utf8')).name === 'frontend';

if (!isInFrontend) {
  console.log(`${colors.yellow}Warning: This script should be run from the frontend directory.${colors.reset}`);
  process.exit(1);
}

// Find all React instances in node_modules
console.log(`${colors.blue}Checking for multiple React instances...${colors.reset}`);

const findReactInstances = () => {
  try {
    const result = execSync('find node_modules -name "react" -type d | grep -v "node_modules/react/node_modules"', { cwd: frontendDir }).toString();
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.log(`${colors.red}Error finding React instances: ${error.message}${colors.reset}`);
    return [];
  }
};

const reactInstances = findReactInstances();

if (reactInstances.length > 1) {
  console.log(`${colors.red}Found ${reactInstances.length} React instances:${colors.reset}`);
  reactInstances.forEach(instance => console.log(`- ${instance}`));
  
  console.log(`${colors.yellow}Attempting to fix duplicate React instances...${colors.reset}`);
  
  // Fix approach 1: Clear node_modules and reinstall
  console.log(`${colors.blue}Step 1: Clearing node_modules and reinstalling dependencies...${colors.reset}`);
  try {
    execSync('rm -rf node_modules', { cwd: frontendDir });
    execSync('npm install', { cwd: frontendDir });
    console.log(`${colors.green}Dependencies reinstalled.${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error reinstalling dependencies: ${error.message}${colors.reset}`);
  }
  
  // Fix approach 2: Use npm dedupe
  console.log(`${colors.blue}Step 2: Running npm dedupe...${colors.reset}`);
  try {
    execSync('npm dedupe', { cwd: frontendDir });
    console.log(`${colors.green}Dependencies deduplicated.${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error deduplicating dependencies: ${error.message}${colors.reset}`);
  }
  
  // Check if the issue is fixed
  const newReactInstances = findReactInstances();
  if (newReactInstances.length > 1) {
    console.log(`${colors.red}Still found ${newReactInstances.length} React instances after fixes.${colors.reset}`);
    console.log(`${colors.yellow}You may need to manually resolve the dependencies.${colors.reset}`);
  } else {
    console.log(`${colors.green}Success! Only one React instance found.${colors.reset}`);
  }
} else if (reactInstances.length === 1) {
  console.log(`${colors.green}Good news! Only one React instance found: ${reactInstances[0]}${colors.reset}`);
} else {
  console.log(`${colors.yellow}No React instances found. This is unusual.${colors.reset}`);
}

// Check React and ReactDOM versions
console.log(`${colors.blue}Checking React and ReactDOM versions...${colors.reset}`);

try {
  const reactPackageJson = JSON.parse(fs.readFileSync(path.join(frontendDir, 'node_modules/react/package.json'), 'utf8'));
  const reactDomPackageJson = JSON.parse(fs.readFileSync(path.join(frontendDir, 'node_modules/react-dom/package.json'), 'utf8'));
  
  console.log(`React version: ${colors.green}${reactPackageJson.version}${colors.reset}`);
  console.log(`ReactDOM version: ${colors.green}${reactDomPackageJson.version}${colors.reset}`);
  
  if (reactPackageJson.version !== reactDomPackageJson.version) {
    console.log(`${colors.red}Warning: React and ReactDOM versions don't match!${colors.reset}`);
    console.log(`${colors.yellow}This can cause "Invalid hook call" errors.${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.red}Error checking React versions: ${error.message}${colors.reset}`);
}

console.log(`${colors.cyan}====================${colors.reset}`);
console.log(`${colors.green}Dependency check complete.${colors.reset}`); 