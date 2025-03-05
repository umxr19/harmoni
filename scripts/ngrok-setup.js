/**
 * Ngrok Setup Script
 * 
 * This script sets up Ngrok tunnels for both frontend and backend servers,
 * making your local development environment accessible from the internet.
 * 
 * Prerequisites:
 * - Ngrok installed globally: npm install -g ngrok
 * - Ngrok account and authtoken configured
 * 
 * Run with: node scripts/ngrok-setup.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const FRONTEND_PORT = 5173;
const BACKEND_PORT = 3000;
const TEMP_CONFIG_PATH = path.join(__dirname, '../frontend/src/config/temp-ngrok-config.js');

// Function to start an Ngrok tunnel
const startNgrokTunnel = (port, name) => {
  return new Promise((resolve, reject) => {
    console.log(chalk.yellow(`Starting Ngrok tunnel for ${name} on port ${port}...`));
    
    const ngrokProcess = spawn('ngrok', ['http', port.toString(), '--log=stdout']);
    
    let url = null;
    
    ngrokProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Extract the public URL from Ngrok output
      if (output.includes('url=https://') && !url) {
        const match = output.match(/url=https:\/\/([^\.]+\.ngrok\.io)/);
        if (match && match[1]) {
          url = `https://${match[1]}.ngrok.io`;
          console.log(chalk.green(`✓ ${name} tunnel established: ${url}`));
          resolve({ process: ngrokProcess, url });
        }
      }
      
      // Log errors
      if (output.includes('ERR') || output.includes('Error')) {
        console.error(chalk.red(`Ngrok error: ${output}`));
      }
    });
    
    ngrokProcess.stderr.on('data', (data) => {
      console.error(chalk.red(`Ngrok error: ${data.toString()}`));
    });
    
    ngrokProcess.on('error', (error) => {
      console.error(chalk.red(`Failed to start Ngrok: ${error.message}`));
      reject(error);
    });
    
    // If no URL is found after 10 seconds, assume something went wrong
    setTimeout(() => {
      if (!url) {
        console.error(chalk.red(`Timeout waiting for Ngrok to start for ${name}`));
        ngrokProcess.kill();
        reject(new Error('Ngrok startup timeout'));
      }
    }, 10000);
  });
};

// Function to create a temporary config file for the frontend
const createTempConfig = (backendUrl) => {
  const configContent = `// Temporary configuration for Ngrok testing
// This file is auto-generated and should not be committed to version control

export const API_BASE_URL = '${backendUrl}/api';
export const IS_NGROK_CONFIG = true;

console.log('Using Ngrok configuration with API URL:', API_BASE_URL);
`;

  fs.writeFileSync(TEMP_CONFIG_PATH, configContent);
  console.log(chalk.green(`✓ Created temporary config at ${TEMP_CONFIG_PATH}`));
  console.log(chalk.yellow(`Note: You'll need to import this config in your frontend code temporarily`));
};

// Main function
const main = async () => {
  console.log(chalk.bold.green('\n🌐 NGROK EXTERNAL TESTING SETUP 🌐\n'));
  
  try {
    // Check if ngrok is installed
    try {
      const checkProcess = spawn('ngrok', ['--version']);
      await new Promise((resolve, reject) => {
        checkProcess.on('exit', (code) => {
          if (code !== 0) reject(new Error('Ngrok check failed'));
          resolve();
        });
      });
    } catch (error) {
      console.error(chalk.red('❌ Ngrok is not installed or not in PATH'));
      console.log(chalk.yellow('Please install Ngrok with: npm install -g ngrok'));
      console.log(chalk.yellow('Then set up your authtoken with: ngrok authtoken YOUR_TOKEN'));
      process.exit(1);
    }
    
    // Start tunnels
    const backendTunnel = await startNgrokTunnel(BACKEND_PORT, 'Backend');
    const frontendTunnel = await startNgrokTunnel(FRONTEND_PORT, 'Frontend');
    
    // Create temporary config
    createTempConfig(backendTunnel.url);
    
    console.log(chalk.bold.green('\n📱 MOBILE TESTING INFORMATION 📱\n'));
    console.log(chalk.yellow('To test on any device with internet access:'));
    console.log(chalk.green(`Frontend: ${frontendTunnel.url}`));
    console.log(chalk.green(`Backend API: ${backendTunnel.url}/api`));
    
    console.log(chalk.bold.yellow('\n⚠️ IMPORTANT STEPS ⚠️\n'));
    console.log(chalk.white('1. Temporarily modify your frontend API configuration to use the Ngrok backend URL'));
    console.log(chalk.white(`   Import the temporary config from: ${path.relative(process.cwd(), TEMP_CONFIG_PATH)}`));
    console.log(chalk.white('2. Restart your frontend development server'));
    console.log(chalk.white('3. Access your application using the frontend Ngrok URL'));
    console.log(chalk.white('4. When finished, press Ctrl+C to stop the Ngrok tunnels'));
    console.log(chalk.white('5. Remember to revert any temporary changes to your code\n'));
    
    // Keep the script running until user terminates
    console.log(chalk.cyan('Ngrok tunnels are active. Press Ctrl+C to stop...\n'));
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nShutting down Ngrok tunnels...'));
      backendTunnel.process.kill();
      frontendTunnel.process.kill();
      
      // Remove temporary config file
      if (fs.existsSync(TEMP_CONFIG_PATH)) {
        fs.unlinkSync(TEMP_CONFIG_PATH);
        console.log(chalk.green('✓ Removed temporary config file'));
      }
      
      console.log(chalk.green('✓ Ngrok tunnels closed'));
      process.exit(0);
    });
  } catch (error) {
    console.error(chalk.red(`Error setting up Ngrok: ${error.message}`));
    process.exit(1);
  }
};

// Run the script
main(); 