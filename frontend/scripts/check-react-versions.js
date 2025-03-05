/**
 * This script checks React versions across the project
 * Run with: node scripts/check-react-versions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}React Version Checker${colors.reset}`);
console.log(`${colors.cyan}====================${colors.reset}`);

// Check frontend package.json
const frontendPackageJsonPath = path.join(path.dirname(__dirname), 'package.json');
let frontendReactVersion = null;
let frontendReactDomVersion = null;

if (fs.existsSync(frontendPackageJsonPath)) {
  const frontendPackageJson = JSON.parse(fs.readFileSync(frontendPackageJsonPath, 'utf8'));
  frontendReactVersion = frontendPackageJson.dependencies?.react;
  frontendReactDomVersion = frontendPackageJson.dependencies?.['react-dom'];
  
  console.log(`${colors.blue}Frontend package.json:${colors.reset}`);
  console.log(`- React: ${colors.green}${frontendReactVersion || 'Not found'}${colors.reset}`);
  console.log(`- ReactDOM: ${colors.green}${frontendReactDomVersion || 'Not found'}${colors.reset}`);
} else {
  console.log(`${colors.red}Frontend package.json not found${colors.reset}`);
}

// Check root package.json
const rootPackageJsonPath = path.join(path.dirname(__dirname), '..', 'package.json');
let rootReactVersion = null;
let rootReactDomVersion = null;

if (fs.existsSync(rootPackageJsonPath)) {
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
  rootReactVersion = rootPackageJson.dependencies?.react;
  rootReactDomVersion = rootPackageJson.dependencies?.['react-dom'];
  
  console.log(`${colors.blue}Root package.json:${colors.reset}`);
  console.log(`- React: ${colors.green}${rootReactVersion || 'Not found'}${colors.reset}`);
  console.log(`- ReactDOM: ${colors.green}${rootReactDomVersion || 'Not found'}${colors.reset}`);
} else {
  console.log(`${colors.yellow}Root package.json not found${colors.reset}`);
}

// Check installed versions
console.log(`${colors.blue}Checking installed versions:${colors.reset}`);

try {
  const frontendReactPackageJsonPath = path.join(path.dirname(__dirname), 'node_modules', 'react', 'package.json');
  if (fs.existsSync(frontendReactPackageJsonPath)) {
    const reactPackageJson = JSON.parse(fs.readFileSync(frontendReactPackageJsonPath, 'utf8'));
    console.log(`- Frontend node_modules React: ${colors.green}${reactPackageJson.version}${colors.reset}`);
  } else {
    console.log(`- Frontend node_modules React: ${colors.red}Not installed${colors.reset}`);
  }
  
  const frontendReactDomPackageJsonPath = path.join(path.dirname(__dirname), 'node_modules', 'react-dom', 'package.json');
  if (fs.existsSync(frontendReactDomPackageJsonPath)) {
    const reactDomPackageJson = JSON.parse(fs.readFileSync(frontendReactDomPackageJsonPath, 'utf8'));
    console.log(`- Frontend node_modules ReactDOM: ${colors.green}${reactDomPackageJson.version}${colors.reset}`);
  } else {
    console.log(`- Frontend node_modules ReactDOM: ${colors.red}Not installed${colors.reset}`);
  }
  
  const rootReactPackageJsonPath = path.join(path.dirname(__dirname), '..', 'node_modules', 'react', 'package.json');
  if (fs.existsSync(rootReactPackageJsonPath)) {
    const reactPackageJson = JSON.parse(fs.readFileSync(rootReactPackageJsonPath, 'utf8'));
    console.log(`- Root node_modules React: ${colors.green}${reactPackageJson.version}${colors.reset}`);
  } else {
    console.log(`- Root node_modules React: ${colors.yellow}Not installed${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.red}Error checking installed versions: ${error.message}${colors.reset}`);
}

// Check for version mismatches
console.log(`${colors.blue}Checking for version mismatches:${colors.reset}`);

if (frontendReactVersion && rootReactVersion && frontendReactVersion !== rootReactVersion) {
  console.log(`${colors.red}WARNING: React version mismatch between frontend and root!${colors.reset}`);
  console.log(`${colors.yellow}This can cause "Invalid hook call" errors.${colors.reset}`);
  console.log(`${colors.yellow}Consider updating the root package.json to match the frontend version.${colors.reset}`);
} else if (frontendReactVersion && rootReactVersion) {
  console.log(`${colors.green}React versions match between frontend and root.${colors.reset}`);
}

if (frontendReactDomVersion && rootReactDomVersion && frontendReactDomVersion !== rootReactDomVersion) {
  console.log(`${colors.red}WARNING: ReactDOM version mismatch between frontend and root!${colors.reset}`);
  console.log(`${colors.yellow}This can cause "Invalid hook call" errors.${colors.reset}`);
  console.log(`${colors.yellow}Consider updating the root package.json to match the frontend version.${colors.reset}`);
} else if (frontendReactDomVersion && rootReactDomVersion) {
  console.log(`${colors.green}ReactDOM versions match between frontend and root.${colors.reset}`);
}

console.log(`${colors.cyan}====================${colors.reset}`);
console.log(`${colors.green}Version check complete.${colors.reset}`); 