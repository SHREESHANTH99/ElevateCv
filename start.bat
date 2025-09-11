@echo off
echo Starting ElevateCV Resume Builder...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Choose server mode:
echo 1. Full Backend with MongoDB (requires MongoDB installation)
echo 2. Test Backend with In-Memory Storage (no MongoDB required)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo Starting Full Backend Server with MongoDB...
    cd Backend
    start "Backend Server" cmd /k "npm run dev"
) else if "%choice%"=="2" (
    echo Starting Test Backend Server with In-Memory Storage...
    cd Backend
    start "Test Backend Server" cmd /k "node test-server.js"
) else (
    echo Invalid choice. Starting test server by default...
    cd Backend
    start "Test Backend Server" cmd /k "node test-server.js"
)

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd ..\Frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting up...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo.
if "%choice%"=="2" (
    echo NOTE: Using in-memory storage - data will be lost when server restarts
    echo This is perfect for testing and demo purposes!
)
echo.
echo Press any key to exit this window...
pause >nul
