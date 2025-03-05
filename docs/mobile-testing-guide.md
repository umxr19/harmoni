# Mobile Testing Guide for Question Bank App

This guide provides detailed instructions for testing the Question Bank Application on mobile devices before deployment.

## Table of Contents

1. [Local Network Testing](#local-network-testing)
2. [Using Mobile Device Emulators](#using-mobile-device-emulators)
3. [Using Browser DevTools](#using-browser-devtools)
4. [Using Ngrok for External Access](#using-ngrok-for-external-access)
5. [Using BrowserStack or LambdaTest](#using-browserstack-or-lambdatest)
6. [Mobile Testing Checklist](#mobile-testing-checklist)
7. [Common Mobile Issues](#common-mobile-issues)

## Local Network Testing

The simplest way to test on real mobile devices is to connect them to the same network as your development machine.

### Prerequisites

- Your development computer and mobile device connected to the same WiFi network
- Frontend and backend servers running on your development machine
- Firewall configured to allow connections on ports 3001 (backend) and 5173 (frontend)

### Steps

1. **Start the development servers with mobile testing support**:
   ```bash
   npm run dev:mobile
   ```

2. This will:
   - Start the backend server
   - Start the frontend server with network access enabled
   - Display your local IP addresses for testing

3. **On your mobile device**:
   - Connect to the same WiFi network as your development computer
   - Open a web browser
   - Navigate to the URL shown in the terminal (e.g., `http://192.168.1.100:5173`)

### Troubleshooting

- If you can't connect, check your firewall settings
- Ensure both devices are on the same network
- Try disabling any VPNs on both devices

## Using Mobile Device Emulators

### Android Emulator

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Follow the installation instructions

2. **Create a Virtual Device**:
   - Open Android Studio
   - Go to Tools > AVD Manager
   - Click "Create Virtual Device"
   - Select a device definition (e.g., Pixel 6)
   - Select a system image (e.g., Android 13)
   - Complete the setup

3. **Launch the Emulator**:
   - Start the virtual device from AVD Manager
   - Open the Chrome browser in the emulator
   - Navigate to `http://10.0.2.2:5173` (special IP that redirects to your host machine's localhost)

### iOS Simulator (macOS only)

1. **Install Xcode**:
   - Download from the Mac App Store
   - Open and complete the installation

2. **Launch iOS Simulator**:
   - Open Xcode
   - Go to Xcode > Open Developer Tool > Simulator
   - Select a device from the Hardware > Device menu

3. **Test Your Application**:
   - Open Safari in the simulator
   - Navigate to `http://localhost:5173`

## Using Browser DevTools

Modern browsers include tools to simulate mobile devices.

### Chrome DevTools

1. Open your application in Chrome (`http://localhost:5173`)
2. Right-click and select "Inspect" or press F12
3. Click the "Toggle device toolbar" button (or press Ctrl+Shift+M)
4. Select a device from the dropdown at the top
5. Test your application in the simulated mobile viewport

### Firefox Responsive Design Mode

1. Open your application in Firefox
2. Right-click and select "Inspect" or press F12
3. Click the "Responsive Design Mode" button (or press Ctrl+Shift+M)
4. Select a device preset or set custom dimensions

### Safari Developer Tools (macOS)

1. Enable Developer menu: Safari > Preferences > Advanced > "Show Develop menu in menu bar"
2. Open your application in Safari
3. Go to Develop > Enter Responsive Design Mode
4. Select a device preset or set custom dimensions

## Using Ngrok for External Access

Ngrok allows you to expose your local development server to the internet, making it accessible from any device.

### Setup

1. **Install Ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start your development servers**:
   ```bash
   npm run dev
   cd frontend && npm run dev
   ```

3. **Create a tunnel to your frontend**:
   ```bash
   ngrok http 5173
   ```

4. **Create a tunnel to your backend** (in a new terminal):
   ```bash
   ngrok http 3000
   ```

5. Ngrok will display URLs (e.g., `https://a1b2c3d4.ngrok.io`) that you can access from any device with internet access

6. **Update API configuration**:
   - You'll need to temporarily update your frontend's API configuration to use the ngrok URL for your backend

### Benefits

- Test on devices not on your local network
- Share with testers in different locations
- Test on cellular networks instead of WiFi

## Using BrowserStack or LambdaTest

For comprehensive testing across multiple devices and operating systems, consider using a cloud testing service.

### BrowserStack

1. Sign up for an account at [BrowserStack](https://www.browserstack.com/)
2. Use BrowserStack Live to test your local application on real devices
3. Follow their documentation to set up local testing

### LambdaTest

1. Sign up for an account at [LambdaTest](https://www.lambdatest.com/)
2. Use their Real Time Testing feature to test on various devices
3. Follow their documentation to set up local testing

## Mobile Testing Checklist

### Responsive Layout

- [ ] Test on multiple screen sizes (small phones to large tablets)
- [ ] Check that content is properly sized and positioned
- [ ] Verify that text is readable without zooming
- [ ] Ensure no horizontal scrolling is needed
- [ ] Test both portrait and landscape orientations

### Touch Interactions

- [ ] Verify all buttons and controls are large enough to tap (minimum 44x44px)
- [ ] Check that touch targets have sufficient spacing
- [ ] Test swipe gestures if used in the application
- [ ] Ensure hover states are properly handled or avoided

### Forms and Input

- [ ] Test all form inputs with the virtual keyboard
- [ ] Verify that the viewport doesn't shift unexpectedly when the keyboard appears
- [ ] Check that form validation works properly
- [ ] Ensure proper input types are used (email, number, tel, etc.)

### Performance

- [ ] Check loading times on mobile networks (3G/4G)
- [ ] Verify animations run smoothly
- [ ] Test with CPU and network throttling enabled
- [ ] Monitor memory usage during extended sessions

### Functionality

- [ ] Verify all features work correctly on mobile
- [ ] Test offline functionality if applicable
- [ ] Check that error states are properly displayed
- [ ] Ensure notifications and alerts are visible

### Accessibility

- [ ] Test with screen readers (VoiceOver on iOS, TalkBack on Android)
- [ ] Verify proper contrast ratios for text
- [ ] Check that all interactive elements are accessible
- [ ] Test keyboard navigation for external keyboard users

## Common Mobile Issues

### Performance Problems

- **Large Images**: Optimize and use responsive images
- **Heavy JavaScript**: Split code and load only what's needed
- **Render-blocking Resources**: Defer non-critical CSS and JavaScript

### Touch Interaction Issues

- **Small Touch Targets**: Increase size to at least 44x44px
- **Crowded UI Elements**: Add more spacing between interactive elements
- **Hover-dependent Features**: Provide alternatives for touch devices

### Layout Problems

- **Fixed Positioning**: Be careful with fixed elements when the keyboard is visible
- **Viewport Issues**: Ensure proper meta viewport tag is set
- **Font Size Problems**: Use relative units (rem, em) instead of pixels

### Device-specific Issues

- **iOS Safari**: Test for iOS-specific bugs like the 100vh issue
- **Android Fragmentation**: Test on multiple Android versions and devices
- **Browser Compatibility**: Check for features that may not be supported on all mobile browsers

## Conclusion

Thorough mobile testing is essential for ensuring a good user experience on the devices your users will actually use. By following this guide, you can identify and fix mobile-specific issues before deployment, leading to higher user satisfaction and engagement. 