// Simple script to detect which machine is running the code
const os = require('os');
const fs = require('fs');
const path = require('path');

const hostname = os.hostname();
console.log(`Running on machine: ${hostname}`);

// Detect if we're on Mac or the other laptop
const isMac = hostname.includes('Mac');
console.log(`Detected as Mac: ${isMac}`);

// Set appropriate environment file
const envFileName = isMac ? '.env.mac' : '.env.laptop';
console.log(`Using environment file: ${envFileName}`);

// Check if the environment file exists
const envFilePath = path.join(__dirname, '..', envFileName);
if (fs.existsSync(envFilePath)) {
  console.log(`Found environment file at: ${envFilePath}`);
  
  // Copy to active .env file if needed
  const activeEnvPath = path.join(__dirname, '..', '.env');
  try {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    fs.writeFileSync(activeEnvPath, envContent);
    console.log('Environment file configured successfully');
  } catch (error) {
    console.error('Error setting up environment file:', error);
  }
} else {
  console.log(`Environment file not found at: ${envFilePath}`);
  console.log('Please create this file with your machine-specific settings');
}

// Configure frontend API URL based on machine
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');
const apiUrl = isMac 
  ? 'VITE_API_URL=http://localhost:3000/api'
  : 'VITE_API_URL=http://localhost:3000/api';

try {
  fs.writeFileSync(frontendEnvPath, apiUrl);
  console.log('Frontend API URL configured for this machine');
} catch (error) {
  console.error('Error setting up frontend environment:', error);
}

console.log('Machine detection and setup complete'); 