#!/bin/bash

# Bash script to start the Question Bank application development environment
# This script is designed for Unix-based systems (macOS, Linux)

# Display welcome message
echo -e "\e[32mStarting Question Bank Application Development Environment\e[0m"
echo -e "\e[32mThis script will start both the frontend and backend servers\e[0m"
echo -e "\e[32m--------------------------------------------------------------\e[0m"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
  echo -e "\e[31mError: Node.js is not installed or not in PATH\e[0m"
  echo -e "\e[31mPlease install Node.js from https://nodejs.org/\e[0m"
  exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
  echo -e "\e[31mError: npm is not installed or not in PATH\e[0m"
  echo -e "\e[31mPlease install Node.js from https://nodejs.org/ which includes npm\e[0m"
  exit 1
fi

# Check if the frontend directory exists
if [ ! -d "frontend" ]; then
  echo -e "\e[31mError: frontend directory not found\e[0m"
  echo -e "\e[31mPlease run this script from the root of the project\e[0m"
  exit 1
fi

# Check if the backend directory exists
if [ ! -d "backend" ]; then
  echo -e "\e[31mError: backend directory not found\e[0m"
  echo -e "\e[31mPlease run this script from the root of the project\e[0m"
  exit 1
fi

# Function to start a server in a new terminal window
start_server_window() {
  local title="$1"
  local directory="$2"
  local command="$3"
  
  # Check which terminal emulator is available
  if command_exists gnome-terminal; then
    # Linux with GNOME
    gnome-terminal --title="$title" -- bash -c "cd $directory && echo -e '\e[32mStarting $title...\e[0m' && echo -e '\e[36mDirectory: $directory\e[0m' && echo -e '\e[36mCommand: $command\e[0m' && echo -e '\e[32m--------------------------------------------------------------\e[0m' && $command; exec bash"
  elif command_exists konsole; then
    # Linux with KDE
    konsole --new-tab --title "$title" -e bash -c "cd $directory && echo -e '\e[32mStarting $title...\e[0m' && echo -e '\e[36mDirectory: $directory\e[0m' && echo -e '\e[36mCommand: $command\e[0m' && echo -e '\e[32m--------------------------------------------------------------\e[0m' && $command; exec bash"
  elif command_exists xterm; then
    # Generic X terminal
    xterm -title "$title" -e "cd $directory && echo -e '\e[32mStarting $title...\e[0m' && echo -e '\e[36mDirectory: $directory\e[0m' && echo -e '\e[36mCommand: $command\e[0m' && echo -e '\e[32m--------------------------------------------------------------\e[0m' && $command; exec bash"
  elif command_exists osascript; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd $directory && echo -e '\\\e[32mStarting $title...\\\e[0m' && echo -e '\\\e[36mDirectory: $directory\\\e[0m' && echo -e '\\\e[36mCommand: $command\\\e[0m' && echo -e '\\\e[32m--------------------------------------------------------------\\\e[0m' && $command\""
  else
    # Fallback to running in the background
    echo -e "\e[33mWarning: Could not detect terminal emulator. Running $title in the background.\e[0m"
    (cd "$directory" && $command &)
  fi
}

# Start the frontend server
echo -e "\e[32mStarting frontend server...\e[0m"
start_server_window "Question Bank - Frontend" "$(pwd)/frontend" "npm run dev"

# Wait a moment before starting the backend
sleep 2

# Start the backend server
echo -e "\e[32mStarting backend server...\e[0m"
start_server_window "Question Bank - Backend" "$(pwd)/backend" "npm run dev"

# Display success message
echo -e "\e[32m--------------------------------------------------------------\e[0m"
echo -e "\e[32mDevelopment environment started successfully!\e[0m"
echo -e "\e[36mFrontend: http://localhost:5173\e[0m"
echo -e "\e[36mBackend: http://localhost:3000\e[0m"
echo -e "\e[32m--------------------------------------------------------------\e[0m"
echo -e "\e[33mPress Ctrl+C in each window to stop the servers when done\e[0m" 