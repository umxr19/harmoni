import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import chalk from 'chalk';

const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ️ ' + msg)),
  success: (msg: string) => console.log(chalk.green('✅ ' + msg)),
  warning: (msg: string) => console.log(chalk.yellow('⚠️ ' + msg)),
  error: (msg: string) => console.log(chalk.red('❌ ' + msg)),
  debug: (msg: string) => console.log(chalk.gray('🔍 ' + msg))
};

// Resolve the correct path to the .env file
const projectRoot = path.resolve(__dirname, '../..');
const envPath = path.resolve(projectRoot, '.env');

log.debug(`Looking for .env file at: ${envPath}`);

// Load environment variables at the start
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
  process.exit(1);
}

async function checkEnvFile(): Promise<boolean> {
  try {
    if (!fs.existsSync(envPath)) {
      log.error('.env file not found!');
      log.info('Please create a .env file in your project root with:');
      log.info('OPENAI_API_KEY=your-api-key-here');
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (!envContent.includes('OPENAI_API_KEY')) {
      log.error('OPENAI_API_KEY not found in .env file!');
      log.info('Add OPENAI_API_KEY=your-api-key-here to your .env file');
      return false;
    }
    
    log.success('.env file configuration looks good');
    log.debug(`Found .env file at: ${envPath}`);
    return true;
  } catch (error) {
    log.error(`Error checking .env file: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

function validateApiKey(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  
  log.debug('Environment variables loaded:');
  log.debug(`OPENAI_API_KEY exists: ${!!apiKey}`);
  if (apiKey) {
    log.debug(`OPENAI_API_KEY length: ${apiKey.length}`);
    log.debug(`OPENAI_API_KEY format check: ${apiKey.startsWith('sk-') ? 'starts with sk-' : apiKey.startsWith('sk-proj-') ? 'starts with sk-proj-' : 'invalid format'}`);
  }
  
  if (!apiKey) {
    log.error('OpenAI API key not found in environment variables');
    return false;
  }

  if (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-')) {
    log.error('Invalid API key format. Key should start with either "sk-" or "sk-proj-"');
    log.debug('Key format validation failed. Please check your .env file.');
    return false;
  }

  log.success('API key format is valid');
  return true;
}

function checkOpenAIPackage(): boolean {
  try {
    const output = execSync('npm list openai --json').toString();
    const packageInfo = JSON.parse(output);
    
    if (!packageInfo.dependencies?.openai) {
      log.error('OpenAI package not installed!');
      log.info('Install it using: npm install openai');
      return false;
    }

    const installedVersion = packageInfo.dependencies.openai.version;
    log.success(`OpenAI SDK version ${installedVersion} is installed`);
    
    // Check for latest version
    const latestVersion = execSync('npm view openai version').toString().trim();
    if (installedVersion !== latestVersion) {
      log.warning(`A newer version (${latestVersion}) is available. Current: ${installedVersion}`);
      log.info('Update using: npm update openai');
    }

    return true;
  } catch (error) {
    log.error(`Error checking OpenAI package: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function testOpenAIConnection(): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  log.debug(`Using API key for connection test: ${apiKey?.substring(0, 8)}...`);
  
  const openai = new OpenAI({
    apiKey: apiKey
  });

  try {
    log.info('Testing OpenAI connection...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello, this is a test message." }],
      max_tokens: 10
    });

    if (completion.choices[0].message) {
      log.success('Successfully connected to OpenAI API');
      return true;
    }
    
    log.error('No response received from OpenAI');
    return false;
  } catch (error) {
    log.error('Failed to connect to OpenAI API');
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        log.error('Authentication failed. Please check your API key');
        log.debug('Full error message: ' + error.message);
      } else if (error.message.includes('429')) {
        log.error('Rate limit exceeded. Please try again later');
      } else {
        log.error(`Error: ${error.message}`);
      }
    }
    return false;
  }
}

async function validateOpenAISetup() {
  log.info('Starting OpenAI integration validation...\n');

  const checks = [
    { name: 'Environment File', fn: checkEnvFile },
    { name: 'API Key', fn: validateApiKey },
    { name: 'OpenAI Package', fn: checkOpenAIPackage },
    { name: 'API Connection', fn: testOpenAIConnection }
  ];

  let allPassed = true;

  for (const check of checks) {
    log.info(`\nRunning ${check.name} check...`);
    const result = await check.fn();
    if (!result) {
      allPassed = false;
      log.error(`${check.name} check failed`);
      break; // Stop if any check fails
    }
  }

  if (allPassed) {
    log.success('\n✨ All checks passed! Your OpenAI integration is properly configured.');
  } else {
    log.error('\n❌ Some checks failed. Please fix the issues above and try again.');
  }
}

// Run the validation
validateOpenAISetup().catch(error => {
  log.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}); 