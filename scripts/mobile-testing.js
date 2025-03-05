/**
 * Mobile Testing Helper Script
 * 
 * This script displays your local IP address to make it easier to test
 * your application on mobile devices on the same network.
 * 
 * Run with: node scripts/mobile-testing.js
 */

const os = require('os');
const chalk = require('chalk');

// Get local IP addresses
const getLocalIpAddresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((iface) => {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: interfaceName,
          address: iface.address
        });
      }
    });
  });

  return addresses;
};

// Main function
const displayTestingInfo = () => {
  console.log(chalk.bold.green('\n📱 MOBILE TESTING INFORMATION 📱\n'));
  
  const ipAddresses = getLocalIpAddresses();
  
  if (ipAddresses.length === 0) {
    console.log(chalk.red('❌ No network interfaces found. Are you connected to a network?'));
    return;
  }
  
  console.log(chalk.yellow('To test on mobile devices:'));
  console.log(chalk.yellow('1. Make sure your mobile device is connected to the same WiFi network as this computer'));
  console.log(chalk.yellow('2. Start your frontend and backend servers'));
  console.log(chalk.yellow('3. On your mobile device, open a browser and navigate to one of these URLs:\n'));
  
  ipAddresses.forEach(({interface, address}) => {
    console.log(chalk.cyan(`   Interface: ${interface}`));
    console.log(chalk.green(`   Frontend: http://${address}:5173`));
    console.log(chalk.green(`   Backend:  http://${address}:3000`));
    console.log('');
  });
  
  console.log(chalk.yellow('Note: You may need to temporarily disable your firewall or add exceptions for ports 3000 and 5173'));
  
  // Add troubleshooting information
  console.log(chalk.bold.red('\n⚠️ COMMON MOBILE ISSUES ⚠️\n'));
  console.log(chalk.white('1. CORS errors: If you see CORS errors in the console, check that:'));
  console.log(chalk.white('   - The backend CORS configuration allows connections from your mobile device'));
  console.log(chalk.white('   - You\'re using the correct IP address and port'));
  console.log(chalk.white('2. Authentication issues: If login/registration doesn\'t work:'));
  console.log(chalk.white('   - Check that the API URL in the frontend is correctly configured'));
  console.log(chalk.white('   - Verify that cookies/localStorage are working properly on your mobile browser'));
  console.log(chalk.white('   - Try using Chrome DevTools remote debugging to inspect network requests'));
  console.log(chalk.white('3. Network connectivity: Ensure your mobile device has a stable connection to the WiFi network\n'));
  
  console.log(chalk.bold.green('\n📋 TESTING CHECKLIST 📋\n'));
  console.log(chalk.white('✓ Test responsive layout on different screen sizes'));
  console.log(chalk.white('✓ Check touch interactions (buttons, sliders, etc.)'));
  console.log(chalk.white('✓ Test form inputs and virtual keyboard interactions'));
  console.log(chalk.white('✓ Verify loading states and performance'));
  console.log(chalk.white('✓ Test offline functionality if applicable'));
  console.log(chalk.white('✓ Check font sizes and readability'));
  console.log(chalk.white('✓ Test in both portrait and landscape orientations\n'));
};

// Run the script
displayTestingInfo(); 