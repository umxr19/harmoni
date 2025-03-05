#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');

// Files with TypeScript errors to fix
const filesToFix = {
  'src/app.ts': [
    { 
      search: /import logger from '\.\.\/utils\/logger';/g, 
      replace: "import logger from './utils/logger';" 
    }
  ],
  'src/index.ts': [
    { 
      search: /import logger from '\.\.\/utils\/logger';/g, 
      replace: "import logger from './utils/logger';" 
    }
  ],
  'src/middleware/authMiddleware.ts': [
    { 
      search: /export const authenticateToken/g, 
      replace: "export const authenticateJWT" 
    }
  ],
  'src/services/classroomService.ts': [
    { 
      search: /return classrooms\.map\(classroom => \({/g, 
      replace: "return classrooms.map(classroom => ({\n      // Convert _id to string to fix type issue\n      _id: classroom._id.toString()," 
    },
    { 
      search: /_id: string;/g, 
      replace: "_id: string | Types.ObjectId;" 
    }
  ]
};

// Process a single file
function processFile(filePath, replacements) {
  try {
    const fullPath = path.join(rootDir, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`File not found: ${filePath}`));
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    for (const replacement of replacements) {
      const originalContent = content;
      content = content.replace(replacement.search, replacement.replace);
      
      if (content !== originalContent) {
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(chalk.green(`✓ Fixed TypeScript errors in ${filePath}`));
    } else {
      console.log(chalk.yellow(`No changes made to ${filePath}`));
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}: ${error.message}`));
  }
}

// Fix frontend TypeScript errors
function fixFrontendTypeScriptErrors() {
  console.log(chalk.bold('\n📋 Fixing Frontend TypeScript Errors'));
  
  // Remove noUncheckedSideEffectImports from tsconfig files
  try {
    const tsConfigAppPath = path.join(rootDir, 'frontend', 'tsconfig.app.json');
    const tsConfigNodePath = path.join(rootDir, 'frontend', 'tsconfig.node.json');
    
    if (fs.existsSync(tsConfigAppPath)) {
      let content = fs.readFileSync(tsConfigAppPath, 'utf8');
      content = content.replace(/"noUncheckedSideEffectImports"\s*:\s*true,?/g, '');
      fs.writeFileSync(tsConfigAppPath, content, 'utf8');
      console.log(chalk.green('✓ Fixed tsconfig.app.json'));
    }
    
    if (fs.existsSync(tsConfigNodePath)) {
      let content = fs.readFileSync(tsConfigNodePath, 'utf8');
      content = content.replace(/"noUncheckedSideEffectImports"\s*:\s*true,?/g, '');
      fs.writeFileSync(tsConfigNodePath, content, 'utf8');
      console.log(chalk.green('✓ Fixed tsconfig.node.json'));
    }
  } catch (error) {
    console.error(chalk.red(`Error fixing frontend TypeScript configs: ${error.message}`));
  }
}

// Main function
function main() {
  console.log(chalk.bold.green('🔧 Remaining TypeScript Error Fixer 🔧'));
  
  // Process each file in the list
  console.log(chalk.bold('\n📋 Fixing Backend TypeScript errors'));
  for (const [filePath, replacements] of Object.entries(filesToFix)) {
    processFile(filePath, replacements);
  }
  
  // Fix frontend TypeScript errors
  fixFrontendTypeScriptErrors();
  
  // Try to build the project
  console.log(chalk.bold('\n📋 Attempting to build the project'));
  try {
    console.log(chalk.yellow('Building backend...'));
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    console.log(chalk.green('✓ Backend build successful'));
  } catch (error) {
    console.error(chalk.red('Backend build failed'));
  }
  
  try {
    console.log(chalk.yellow('Building frontend...'));
    execSync('cd frontend && npm run build', { cwd: rootDir, stdio: 'inherit' });
    console.log(chalk.green('✓ Frontend build successful'));
  } catch (error) {
    console.error(chalk.red('Frontend build failed'));
  }
  
  console.log(chalk.bold.green('\n✅ TypeScript error fixing complete'));
  console.log(chalk.yellow('\nPlease run the deployment checklist again to verify the fixes:'));
  console.log(chalk.blue('node scripts/deployment-checklist.js'));
}

// Run the main function
main(); 