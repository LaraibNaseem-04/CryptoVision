@echo off
REM CryptoVision - Quick Start Script for Windows
REM This script starts both the backend and frontend servers

echo.
echo ========================================
echo   CryptoVision - Bitcoin Price Prediction
echo   Quick Start Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo         Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo         Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python and Node.js are installed
echo.

REM Setup and start backend
echo ========================================
echo   Starting Backend (Flask API)
echo ========================================
echo.

cd backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt -q

REM Start Flask server in a new window
echo [INFO] Starting Flask server on http://localhost:5000
start cmd /k python app.py

REM Wait for backend to start
timeout /t 5 /nobreak

REM Navigate to frontend
cd ..\frontend

REM Install dependencies
echo [INFO] Installing Node.js dependencies...
npm install -q

REM Start React dev server
echo [INFO] Starting React dev server on http://localhost:3000
echo.
echo ========================================
echo   CryptoVision is Starting Up!
echo ========================================
echo.
echo   Backend API:   http://localhost:5000
echo   Frontend UI:   http://localhost:3000
echo.
echo   Prediction API Docs:  http://localhost:5000/api/model-info
echo.
echo   Press Ctrl+C in either terminal to stop
echo   Close terminals to shutdown both servers
echo.
echo ========================================
echo.

npm run dev

pause
