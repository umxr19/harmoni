#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');

// Files with TypeScript errors to fix
const filesToFix = {
  'src/controllers/authController.ts': [
    { 
      search: /payload,/g, 
      replace: '{ ...payload, id: payload.id.toString() },' 
    }
  ],
  'src/services/authService.ts': [
    { 
      search: /payload,/g, 
      replace: '{ ...payload, id: payload.id.toString() },' 
    }
  ],
  'src/index.ts': [
    { 
      search: /app\._router\.stack\.forEach\(\(middleware\)/g, 
      replace: 'app._router.stack.forEach((middleware: any)' 
    },
    { 
      search: /middleware\.handle\.stack\.forEach\(\(handler\)/g, 
      replace: 'middleware.handle.stack.forEach((handler: any)' 
    }
  ],
  'src/routes/activityRoutes.ts': [
    { 
      search: /import \{ authenticateJWT \} from '\.\.\/middleware\/auth';/g, 
      replace: "import { authenticateJWT } from '../middleware/authMiddleware';" 
    },
    { 
      search: /router\.post\('\/user\/activity', activityController\.logActivity\);/g, 
      replace: "router.post('/user/activity', authenticateJWT, activityController.logActivity);" 
    },
    { 
      search: /router\.get\('\/analytics\/user', activityController\.getUserAnalytics\);/g, 
      replace: "router.get('/analytics/user', authenticateJWT, activityController.getUserAnalytics);" 
    },
    { 
      search: /router\.get\('\/user\/activity', activityController\.getUserActivity\);/g, 
      replace: "router.get('/user/activity', authenticateJWT, activityController.getUserActivity);" 
    },
    { 
      search: /router\.get\('\/analytics\/category\/:category', activityController\.getCategoryAnalytics\);/g, 
      replace: "router.get('/analytics/category/:category', authenticateJWT, activityController.getCategoryAnalytics);" 
    }
  ],
  'src/routes/progressRoutes.ts': [
    { 
      search: /authorizeRoles\(\['parent'\]\)/g, 
      replace: "authorizeRoles('parent')" 
    }
  ],
  'src/scripts/testExamApi.ts': [
    { 
      search: /console\.error\('API test failed:', error\.message\);/g, 
      replace: "console.error('API test failed:', error instanceof Error ? error.message : 'Unknown error');" 
    },
    { 
      search: /if \(error\.response\) \{/g, 
      replace: "if (error && typeof error === 'object' && 'response' in error) {" 
    },
    { 
      search: /console\.error\('Status:', error\.response\.status\);/g, 
      replace: "console.error('Status:', error.response?.status);" 
    },
    { 
      search: /console\.error\('Data:', error\.response\.data\);/g, 
      replace: "console.error('Data:', error.response?.data);" 
    }
  ],
  'src/services/attemptService.ts': [
    { 
      search: /const correctOption = question\.options\.find\(opt =>/g, 
      replace: "const correctOption = question.options.find((opt: any) =>" 
    }
  ],
  'src/services/classroomService.ts': [
    { 
      search: /interface PopulatedClassroom extends Omit<IClassroom, 'teacherId' \| 'students'>/g, 
      replace: "interface IClassroom {\n  _id: string;\n  name: string;\n  description: string;\n  teacherId: string;\n  students: string[];\n  createdAt: Date;\n  updatedAt: Date;\n}\n\ninterface PopulatedClassroom extends Omit<IClassroom, 'teacherId' | 'students'>" 
    },
    { 
      search: /results\.push\(\{ email, status: 'error', message: error\.message \}\);/g, 
      replace: "results.push({ email, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });" 
    }
  ],
  'src/services/profileService.ts': [
    { 
      search: /avatarUrl: updates\.avatarUrl/g, 
      replace: "avatarUrl: updates.avatarUrl as string" 
    }
  ]
};

// Create middleware directory if it doesn't exist
function createAuthMiddleware() {
  const middlewareDir = path.join(rootDir, 'src', 'middleware');
  const authMiddlewarePath = path.join(middlewareDir, 'authMiddleware.ts');
  
  // Create middleware directory if it doesn't exist
  if (!fs.existsSync(middlewareDir)) {
    console.log(chalk.yellow(`Creating middleware directory: ${middlewareDir}`));
    fs.mkdirSync(middlewareDir, { recursive: true });
  }
  
  // Check if authMiddleware.ts already exists
  if (!fs.existsSync(authMiddlewarePath)) {
    console.log(chalk.yellow(`Creating auth middleware: ${authMiddlewarePath}`));
    
    const authMiddlewareContent = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      id: string;
      email: string;
      role: string;
    };
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeRoles = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: \`Access denied. Required role: \${allowedRoles.join(' or ')}\` 
      });
    }
    
    next();
  };
};
`;
    
    fs.writeFileSync(authMiddlewarePath, authMiddlewareContent, 'utf8');
    console.log(chalk.green('✓ Auth middleware created successfully'));
  } else {
    console.log(chalk.green('✓ Auth middleware already exists'));
  }
}

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

// Main function
function main() {
  console.log(chalk.bold.green('🔧 TypeScript Error Fixer 🔧'));
  
  // Create auth middleware
  createAuthMiddleware();
  
  // Process each file in the list
  console.log(chalk.bold('\n📋 Fixing TypeScript errors in files'));
  for (const [filePath, replacements] of Object.entries(filesToFix)) {
    processFile(filePath, replacements);
  }
  
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