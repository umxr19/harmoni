# Cross-Platform Development Guide

This document provides guidance for developing and running the Question Bank application across different operating systems and environments.

## Command Line Differences

### Windows PowerShell

PowerShell has different syntax for command chaining compared to bash/sh shells. Here are some key differences:

1. **Command Chaining**:
   - Bash/sh uses `&&` to chain commands: `cd frontend && npm run dev`
   - PowerShell uses semicolon `;` or the `-and` operator: `cd frontend; npm run dev`

2. **Environment Variables**:
   - Bash/sh: `export NODE_ENV=production`
   - PowerShell: `$env:NODE_ENV="production"`

3. **Running the Application**:
   ```powershell
   # Navigate to frontend directory
   cd frontend
   
   # Start the development server
   npm run dev
   
   # In a separate terminal, navigate to backend directory
   cd backend
   
   # Start the backend server
   npm run dev
   ```

### Unix-based Systems (macOS, Linux)

1. **Command Chaining**:
   - Use `&&` to chain commands: `cd frontend && npm run dev`

2. **Environment Variables**:
   - Use `export`: `export NODE_ENV=production`

3. **Running the Application**:
   ```bash
   # Navigate to frontend directory and start the development server
   cd frontend && npm run dev
   
   # In a separate terminal, navigate to backend directory and start the backend server
   cd backend && npm run dev
   ```

## Cross-Platform Scripts

To ensure scripts work across different platforms, we recommend:

1. **Using cross-env**:
   - Install: `npm install --save-dev cross-env`
   - Usage in package.json:
     ```json
     "scripts": {
       "dev": "cross-env NODE_ENV=development vite",
       "build": "cross-env NODE_ENV=production tsc && vite build"
     }
     ```

2. **Path Separators**:
   - Always use forward slashes (`/`) in paths, even on Windows
   - Example: `"build": "rimraf ./dist && tsc"`

3. **File System Operations**:
   - Use Node.js path module to handle paths: `const path = require('path')`
   - Join paths with: `path.join(__dirname, 'folder', 'file.js')`

## Mobile Testing

When testing the application on mobile devices:

1. **Local Network Access**:
   - Start the development server with host option: `vite --host`
   - Access via local IP address: `http://192.168.x.x:5173`

2. **Debugging Mobile Issues**:
   - iOS Safari: Use Safari on macOS to remote debug
   - Android Chrome: Use Chrome DevTools remote debugging

3. **Testing Authentication**:
   - Ensure cookies and localStorage work correctly on mobile browsers
   - Test private browsing/incognito mode for authentication flows

## Common Issues and Solutions

1. **CORS Issues**:
   - Ensure backend has proper CORS headers for your frontend URL
   - For local development, add your local IP to allowed origins

2. **Authentication Problems**:
   - Check that JWT tokens are properly stored and included in requests
   - Verify that token expiration is handled correctly

3. **PowerShell Command Execution**:
   - If you encounter `The token '&&' is not a valid statement separator in this version` error:
     - Replace `&&` with `;` in commands
     - Or run commands separately

4. **Path Resolution Issues**:
   - Use relative paths with forward slashes
   - For absolute paths, use Node.js path module

## Script Execution Permissions

### Windows

On Windows, PowerShell scripts (.ps1 files) may be blocked from running due to execution policies. To run the scripts:

1. **Check current execution policy**:
   ```powershell
   Get-ExecutionPolicy
   ```

2. **Set execution policy to allow scripts** (run PowerShell as Administrator):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Run the script**:
   ```powershell
   .\scripts\start-dev-windows.ps1
   ```

### Unix-based Systems (macOS, Linux)

On Unix-based systems, shell scripts need to be made executable:

1. **Make the script executable**:
   ```bash
   chmod +x scripts/start-dev-unix.sh
   ```

2. **Run the script**:
   ```bash
   ./scripts/start-dev-unix.sh
   ```

Note: The `chmod` command is not available on Windows. If you're developing on Windows but need to make scripts executable for Unix systems, you can:
- Use Git Bash which provides Unix-like commands on Windows
- Set the executable bit when committing to Git: `git update-index --chmod=+x scripts/start-dev-unix.sh`
- Or wait until the script is on a Unix system to make it executable

By following these guidelines, you can ensure a smooth development experience across different platforms and environments. 