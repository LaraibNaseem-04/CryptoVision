#!/bin/bash

# CryptoVision - Quick Start Script for Linux/macOS
# This script starts both the backend and frontend servers

echo ""
echo "========================================"
echo "  CryptoVision - Bitcoin Price Prediction"
echo "  Quick Start Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "        Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "        Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "[OK] Python and Node.js are installed"
echo ""

# Setup and start backend
echo "========================================"
echo "  Starting Backend (Flask API)"
echo "========================================"
echo ""

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo "[INFO] Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "[INFO] Installing Python dependencies..."
pip install -r requirements.txt -q

# Start Flask server in background
echo "[INFO] Starting Flask server on http://localhost:5000"
python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Navigate to frontend
cd ../frontend

# Install dependencies
echo "[INFO] Installing Node.js dependencies..."
npm install -q

# Display startup information
echo ""
echo "========================================"
echo "  CryptoVision is Starting Up!"
echo "========================================"
echo ""
echo "  Backend API:   http://localhost:5000"
echo "  Frontend UI:   http://localhost:3000"
echo ""
echo "  Prediction API Docs:  http://localhost:5000/api/model-info"
echo ""
echo "  Press Ctrl+C to stop servers"
echo ""
echo "========================================"
echo ""

# Start React dev server
npm run dev

# Cleanup
kill $BACKEND_PID 2>/dev/null

exit 0
