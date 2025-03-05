# PowerShell script to start the Question Bank application development environment
# This script is designed for Windows users who encounter issues with command chaining

# Display welcome message
Write-Host "Starting Question Bank Application Development Environment" -ForegroundColor Green
Write-Host "This script will start both the frontend and backend servers" -ForegroundColor Green
Write-Host "--------------------------------------------------------------" -ForegroundColor Green

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check if Node.js is installed
if (-not (Test-CommandExists "node")) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Test-CommandExists "npm")) {
    Write-Host "Error: npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ which includes npm" -ForegroundColor Red
    exit 1
}

# Check if the frontend directory exists
if (-not (Test-Path -Path "frontend")) {
    Write-Host "Error: frontend directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the root of the project" -ForegroundColor Red
    exit 1
}

# Check if the backend directory exists
if (-not (Test-Path -Path "backend")) {
    Write-Host "Error: backend directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the root of the project" -ForegroundColor Red
    exit 1
}

# Function to start a server in a new PowerShell window
function Start-ServerWindow {
    param (
        [string]$title,
        [string]$directory,
        [string]$command
    )
    
    $scriptBlock = {
        param($dir, $cmd, $windowTitle)
        Set-Location -Path $dir
        Write-Host "Starting $windowTitle..." -ForegroundColor Green
        Write-Host "Directory: $dir" -ForegroundColor Cyan
        Write-Host "Command: $cmd" -ForegroundColor Cyan
        Write-Host "--------------------------------------------------------------" -ForegroundColor Green
        Invoke-Expression $cmd
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", 
        "& {Set-Location '$directory'; `$host.UI.RawUI.WindowTitle = '$title'; $scriptBlock -dir '$directory' -cmd '$command' -windowTitle '$title'}"
}

# Start the frontend server
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-ServerWindow -title "Question Bank - Frontend" -directory "$PWD\frontend" -command "npm run dev"

# Wait a moment before starting the backend
Start-Sleep -Seconds 2

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Start-ServerWindow -title "Question Bank - Backend" -directory "$PWD\backend" -command "npm run dev"

# Display success message
Write-Host "--------------------------------------------------------------" -ForegroundColor Green
Write-Host "Development environment started successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------------" -ForegroundColor Green
Write-Host "Press Ctrl+C in each window to stop the servers when done" -ForegroundColor Yellow 