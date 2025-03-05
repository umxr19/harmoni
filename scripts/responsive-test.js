/**
 * Responsive Design Testing Script
 * 
 * This script launches multiple browser windows at different screen sizes
 * to help test responsive design without needing physical devices.
 * 
 * Run with: node scripts/responsive-test.js [url]
 * 
 * If no URL is provided, it defaults to http://localhost:5173
 */

const { exec } = require('child_process');
const chalk = require('chalk');
const os = require('os');

// Configuration
const DEFAULT_URL = 'http://localhost:5173';
const VIEWPORT_SIZES = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 12/13 Pro Max', width: 428, height: 926 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1440, height: 900 }
];

// Get URL from command line args or use default
const url = process.argv[2] || DEFAULT_URL;

// Detect operating system
const platform = os.platform();

console.log(chalk.bold.green('\n📱 RESPONSIVE DESIGN TESTING 📱\n'));
console.log(chalk.yellow(`Testing URL: ${url}\n`));

// Function to open browser windows
const openBrowsers = () => {
  VIEWPORT_SIZES.forEach(({ name, width, height }) => {
    let command;
    
    if (platform === 'darwin') {
      // macOS
      command = `open -a "Google Chrome" "${url}" --args --new-window --window-size=${width},${height} --window-position=0,0 --user-data-dir=/tmp/chrome_dev_${width}x${height}`;
    } else if (platform === 'win32') {
      // Windows
      command = `start chrome "${url}" --new-window --window-size=${width},${height} --window-position=0,0 --user-data-dir=%TEMP%\\chrome_dev_${width}x${height}`;
    } else {
      // Linux and others
      command = `google-chrome "${url}" --new-window --window-size=${width},${height} --window-position=0,0 --user-data-dir=/tmp/chrome_dev_${width}x${height}`;
    }
    
    console.log(chalk.cyan(`Opening ${name} (${width}x${height})...`));
    
    exec(command, (error) => {
      if (error) {
        console.error(chalk.red(`Error opening browser for ${name}: ${error.message}`));
        
        if (platform === 'win32' && error.message.includes('start')) {
          console.log(chalk.yellow('On Windows, try running this script from cmd.exe instead of PowerShell'));
        }
        
        if (error.message.includes('Google Chrome') || error.message.includes('google-chrome')) {
          console.log(chalk.yellow('Make sure Google Chrome is installed and in your PATH'));
        }
      }
    });
    
    // Add a small delay between opening windows to prevent issues
    setTimeout(() => {}, 1000);
  });
  
  console.log(chalk.green('\n✓ Browser windows launched for responsive testing'));
  console.log(chalk.yellow('Note: You may need to resize or reposition the windows manually'));
  console.log(chalk.yellow('Tip: Use Chrome DevTools (F12) for more precise device emulation\n'));
};

// Check if URL is valid
if (!url.startsWith('http://') && !url.startsWith('https://')) {
  console.error(chalk.red('❌ Invalid URL. Please provide a URL starting with http:// or https://'));
  process.exit(1);
}

// Run the script
openBrowsers(); 