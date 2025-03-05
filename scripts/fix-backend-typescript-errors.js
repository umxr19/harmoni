#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');

// Files with logger import issues
const loggerImportFiles = [
  'src/config/database-optimization.ts',
  'src/config/database.ts',
  'src/controllers/authController.ts',
  'src/middleware/cacheMiddleware.ts',
  'src/middleware/errorMiddleware.ts',
  'src/middleware/rateLimitMiddleware.ts',
  'src/middleware/validationMiddleware.ts'
];

// Files with authenticateToken vs authenticateJWT issues
const authMiddlewareFiles = [
  'src/routes/analyticsRoutes.ts',
  'src/routes/authRoutes.ts',
  'src/routes/classroomRoutes.ts',
  'src/routes/debugRoutes.ts',
  'src/routes/examRoutes.ts',
  'src/routes/practiceRoutes.ts',
  'src/routes/progressRoutes.ts',
  'src/routes/questionRoutes.ts',
  'src/routes/userRoutes.ts',
  'src/routes/wellbeingRoutes.ts'
];

// Fix logger import issues
function fixLoggerImports() {
  console.log(chalk.blue('Fixing logger import issues...'));
  
  loggerImportFiles.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace { logger } with default import
      content = content.replace(
        /import\s*{\s*logger\s*}\s*from\s*['"](.+)['"];?/g, 
        'import logger from "$1";'
      );
      
      fs.writeFileSync(fullPath, content);
      console.log(chalk.green(`✓ Fixed logger import in ${filePath}`));
    } else {
      console.log(chalk.yellow(`⚠ File not found: ${filePath}`));
    }
  });
}

// Fix authenticateToken vs authenticateJWT issues
function fixAuthMiddlewareImports() {
  console.log(chalk.blue('\nFixing authenticateToken vs authenticateJWT issues...'));
  
  authMiddlewareFiles.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace authenticateToken with authenticateJWT in imports
      content = content.replace(
        /import\s*{\s*authenticateToken/g, 
        'import { authenticateJWT'
      );
      
      // Replace authenticateToken with authenticateJWT in usage
      content = content.replace(/authenticateToken/g, 'authenticateJWT');
      
      fs.writeFileSync(fullPath, content);
      console.log(chalk.green(`✓ Fixed auth middleware in ${filePath}`));
    } else {
      console.log(chalk.yellow(`⚠ File not found: ${filePath}`));
    }
  });
}

// Fix TypeScript errors in classroomService.ts
function fixClassroomService() {
  console.log(chalk.blue('\nFixing classroomService.ts issues...'));
  
  const filePath = path.join(rootDir, 'src/services/classroomService.ts');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the duplicate _id property
    content = content.replace(
      /_id: classroom\._id,\s+_id: classroom\._id,/g,
      '_id: classroom._id,'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(chalk.green('✓ Fixed classroomService.ts'));
  } else {
    console.log(chalk.yellow('⚠ File not found: src/services/classroomService.ts'));
  }
}

// Fix TypeScript errors in profileService.ts
function fixProfileService() {
  console.log(chalk.blue('\nFixing profileService.ts issues...'));
  
  const filePath = path.join(rootDir, 'src/services/profileService.ts');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the avatarUrl property access
    content = content.replace(
      /avatarUrl: updates\.avatarUrl as string/g,
      'avatarUrl: updates.avatarUrl ? updates.avatarUrl as string : undefined'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(chalk.green('✓ Fixed profileService.ts'));
  } else {
    console.log(chalk.yellow('⚠ File not found: src/services/profileService.ts'));
  }
}

// Fix TypeScript errors in testExamApi.ts
function fixTestExamApi() {
  console.log(chalk.blue('\nFixing testExamApi.ts issues...'));
  
  const filePath = path.join(rootDir, 'src/scripts/testExamApi.ts');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the error handling
    content = content.replace(
      /logger\.error\('API test failed:', error\.message\);/g,
      'logger.error(\'API test failed:\', error instanceof Error ? error.message : String(error));'
    );
    
    content = content.replace(
      /logger\.error\('Status:', error\.response\.status\);/g,
      'logger.error(\'Status:\', error && typeof error === \'object\' && \'response\' in error && error.response && typeof error.response === \'object\' && \'status\' in error.response ? error.response.status : \'unknown\');'
    );
    
    content = content.replace(
      /logger\.error\('Data:', error\.response\.data\);/g,
      'logger.error(\'Data:\', error && typeof error === \'object\' && \'response\' in error && error.response && typeof error.response === \'object\' && \'data\' in error.response ? error.response.data : \'unknown\');'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(chalk.green('✓ Fixed testExamApi.ts'));
  } else {
    console.log(chalk.yellow('⚠ File not found: src/scripts/testExamApi.ts'));
  }
}

// Fix TypeScript errors in authService.ts
function fixAuthService() {
  console.log(chalk.blue('\nFixing authService.ts issues...'));
  
  const filePath = path.join(rootDir, 'src/services/authService.ts');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the payload.id access
    content = content.replace(
      /{ \.\.\.payload, id: payload\.id\.toString\(\) },/g,
      '{ ...payload, id: typeof payload.id === \'string\' ? payload.id : String(payload.id) },'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(chalk.green('✓ Fixed authService.ts'));
  } else {
    console.log(chalk.yellow('⚠ File not found: src/services/authService.ts'));
  }
}

// Fix TypeScript errors in authController.ts
function fixAuthController() {
  console.log(chalk.blue('\nFixing authController.ts issues...'));
  
  const filePath = path.join(rootDir, 'src/controllers/authController.ts');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the payload.id access
    content = content.replace(
      /{ \.\.\.payload, id: payload\.id\.toString\(\) },/g,
      '{ ...payload, id: typeof payload.id === \'string\' ? payload.id : String(payload.id) },'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(chalk.green('✓ Fixed authController.ts'));
  } else {
    console.log(chalk.yellow('⚠ File not found: src/controllers/authController.ts'));
  }
}

// Main function
async function main() {
  console.log(chalk.cyan('🔧 Starting TypeScript error fixing process...'));
  
  // Fix all the issues
  fixLoggerImports();
  fixAuthMiddlewareImports();
  fixClassroomService();
  fixProfileService();
  fixTestExamApi();
  fixAuthService();
  fixAuthController();
  
  console.log(chalk.cyan('\n🔍 Running TypeScript compiler to check for remaining errors...'));
  
  try {
    execSync('npx tsc', { stdio: 'inherit' });
    console.log(chalk.green('\n✅ All TypeScript errors fixed successfully!'));
  } catch (error) {
    console.log(chalk.yellow('\n⚠ Some TypeScript errors still remain. Please check the output above.'));
  }
  
  console.log(chalk.cyan('\n🚀 Try running the deployment checklist again to verify the fixes:'));
  console.log(chalk.white('node scripts/deployment-checklist.js'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Error:', error));
  process.exit(1);
}); 