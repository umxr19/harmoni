"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const log = {
    info: (msg) => console.log(chalk_1.default.blue('ℹ️ ' + msg)),
    success: (msg) => console.log(chalk_1.default.green('✅ ' + msg)),
    warning: (msg) => console.log(chalk_1.default.yellow('⚠️ ' + msg)),
    error: (msg) => console.log(chalk_1.default.red('❌ ' + msg)),
    debug: (msg) => console.log(chalk_1.default.gray('🔍 ' + msg))
};
// Resolve the correct path to the .env file
const projectRoot = path_1.default.resolve(__dirname, '../..');
const envPath = path_1.default.resolve(projectRoot, '.env');
log.debug(`Looking for .env file at: ${envPath}`);
// Load environment variables at the start
const envResult = dotenv_1.default.config({ path: envPath });
if (envResult.error) {
    console.error('Error loading .env file:', envResult.error);
    process.exit(1);
}
function checkEnvFile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs_1.default.existsSync(envPath)) {
                log.error('.env file not found!');
                log.info('Please create a .env file in your project root with:');
                log.info('OPENAI_API_KEY=your-api-key-here');
                return false;
            }
            const envContent = fs_1.default.readFileSync(envPath, 'utf-8');
            if (!envContent.includes('OPENAI_API_KEY')) {
                log.error('OPENAI_API_KEY not found in .env file!');
                log.info('Add OPENAI_API_KEY=your-api-key-here to your .env file');
                return false;
            }
            log.success('.env file configuration looks good');
            log.debug(`Found .env file at: ${envPath}`);
            return true;
        }
        catch (error) {
            log.error(`Error checking .env file: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    });
}
function validateApiKey() {
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
function checkOpenAIPackage() {
    var _a;
    try {
        const output = (0, child_process_1.execSync)('npm list openai --json').toString();
        const packageInfo = JSON.parse(output);
        if (!((_a = packageInfo.dependencies) === null || _a === void 0 ? void 0 : _a.openai)) {
            log.error('OpenAI package not installed!');
            log.info('Install it using: npm install openai');
            return false;
        }
        const installedVersion = packageInfo.dependencies.openai.version;
        log.success(`OpenAI SDK version ${installedVersion} is installed`);
        // Check for latest version
        const latestVersion = (0, child_process_1.execSync)('npm view openai version').toString().trim();
        if (installedVersion !== latestVersion) {
            log.warning(`A newer version (${latestVersion}) is available. Current: ${installedVersion}`);
            log.info('Update using: npm update openai');
        }
        return true;
    }
    catch (error) {
        log.error(`Error checking OpenAI package: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
function testOpenAIConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.OPENAI_API_KEY;
        log.debug(`Using API key for connection test: ${apiKey === null || apiKey === void 0 ? void 0 : apiKey.substring(0, 8)}...`);
        const openai = new openai_1.OpenAI({
            apiKey: apiKey
        });
        try {
            log.info('Testing OpenAI connection...');
            const completion = yield openai.chat.completions.create({
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
        }
        catch (error) {
            log.error('Failed to connect to OpenAI API');
            if (error instanceof Error) {
                if (error.message.includes('401')) {
                    log.error('Authentication failed. Please check your API key');
                    log.debug('Full error message: ' + error.message);
                }
                else if (error.message.includes('429')) {
                    log.error('Rate limit exceeded. Please try again later');
                }
                else {
                    log.error(`Error: ${error.message}`);
                }
            }
            return false;
        }
    });
}
function validateOpenAISetup() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield check.fn();
            if (!result) {
                allPassed = false;
                log.error(`${check.name} check failed`);
                break; // Stop if any check fails
            }
        }
        if (allPassed) {
            log.success('\n✨ All checks passed! Your OpenAI integration is properly configured.');
        }
        else {
            log.error('\n❌ Some checks failed. Please fix the issues above and try again.');
        }
    });
}
// Run the validation
validateOpenAISetup().catch(error => {
    log.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
