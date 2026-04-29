# 🚀 CryptoVision Setup Guide

Complete step-by-step guide to get CryptoVision running on your machine.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start (Windows)](#quick-start-windows)
3. [Quick Start (macOS/Linux)](#quick-start-macoslinux)
4. [Manual Setup (Windows)](#manual-setup-windows)
5. [Manual Setup (macOS/Linux)](#manual-setup-macoslinux)
6. [Docker Setup](#docker-setup)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB free

### Software Requirements

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher (comes with Node.js)
- **Git**: (optional, for version control)

### Verification

**Check Python:**

```bash
python --version
# or
python3 --version
```

**Check Node.js:**

```bash
node --version
npm --version
```

---

## Quick Start (Windows)

### Option 1: Automated Script (Easiest)

1. **Open Command Prompt** and navigate to the project folder:

   ```bash
   cd C:\Users\YourUsername\Desktop\cryptoPrediction
   ```

2. **Run the startup script**:

   ```bash
   start.bat
   ```

3. **Wait for startup messages** - two terminal windows will open
   - Backend will show: "Running on http://0.0.0.0:5000"
   - Frontend will show: "Local: http://localhost:3000"

4. **Open your browser** to:
   ```
   http://localhost:3000
   ```

---

## Quick Start (macOS/Linux)

### Option 1: Automated Script

1. **Open Terminal** and navigate to the project:

   ```bash
   cd ~/Desktop/cryptoPrediction
   ```

2. **Make script executable**:

   ```bash
   chmod +x start.sh
   ```

3. **Run the startup script**:

   ```bash
   ./start.sh
   ```

4. **Open your browser** to:
   ```
   http://localhost:3000
   ```

---

## Manual Setup (Windows)

### Step 1: Setup Backend

1. **Open Command Prompt** and navigate to backend:

   ```bash
   cd C:\Users\YourUsername\Desktop\cryptoPrediction\backend
   ```

2. **Create Python virtual environment**:

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:

   ```bash
   venv\Scripts\activate.bat
   ```

4. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Start backend server**:

   ```bash
   python app.py
   ```

   **Expected output:**

   ```
   ============================================================
   🚀 CryptoVision - Bitcoin Price Prediction Backend
   ============================================================
   Starting Flask server...
   API Documentation: http://localhost:5000/api/model-info
   ============================================================
    * Running on http://0.0.0.0:5000
   ```

   ✅ **Backend is ready!** Keep this terminal open.

### Step 2: Setup Frontend

1. **Open a NEW Command Prompt** and navigate to frontend:

   ```bash
   cd C:\Users\YourUsername\Desktop\cryptoPrediction\frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

   **Expected output:**

   ```
   VITE v5.0.0  ready in XXX ms

   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

   ✅ **Frontend is ready!**

4. **Browser will open automatically**, or navigate to:
   ```
   http://localhost:3000
   ```

---

## Manual Setup (macOS/Linux)

### Step 1: Setup Backend

1. **Open Terminal** and navigate to backend:

   ```bash
   cd ~/Desktop/cryptoPrediction/backend
   ```

2. **Create Python virtual environment**:

   ```bash
   python3 -m venv venv
   ```

3. **Activate virtual environment**:

   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Start backend server**:

   ```bash
   python app.py
   ```

   ✅ **Backend is ready!** Keep this terminal open.

### Step 2: Setup Frontend

1. **Open a NEW Terminal** and navigate to frontend:

   ```bash
   cd ~/Desktop/cryptoPrediction/frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

   ✅ **Frontend is ready!**

4. **Open browser** to:
   ```
   http://localhost:3000
   ```

---

## Docker Setup

### Prerequisites

- **Docker**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Included with Docker Desktop

### Steps

1. **Navigate to project directory**:

   ```bash
   cd ~/Desktop/cryptoPrediction
   ```

2. **Build and run containers**:

   ```bash
   docker-compose up --build
   ```

3. **Wait for startup messages**:

   ```
   cryptovision-backend    | * Running on http://0.0.0.0:5000
   cryptovision-frontend   | Local: http://localhost:3000
   ```

4. **Open browser** to:

   ```
   http://localhost:3000
   ```

5. **Stop containers** (Ctrl+C in terminal):
   ```bash
   docker-compose down
   ```

### View Container Logs

```bash
# Backend logs
docker logs cryptovision-backend

# Frontend logs
docker logs cryptovision-frontend

# Both
docker-compose logs -f
```

---

## Verification

### Test Backend API

1. **Health Check**:

   ```bash
   curl http://localhost:5000/api/health
   ```

   **Success Response**:

   ```json
   {
     "status": "success",
     "message": "CryptoVision Backend is running",
     "timestamp": "2026-04-29T10:30:00"
   }
   ```

2. **Current Price**:

   ```bash
   curl http://localhost:5000/api/current-price
   ```

3. **Model Info**:
   ```bash
   curl http://localhost:5000/api/model-info
   ```

### Test Frontend UI

1. **Navigate to** `http://localhost:3000`
2. **Check if page loads** with CryptoVision header
3. **Verify current price** displays
4. **Click "Next Day"** button and wait for prediction
5. **Verify prediction** displays in table

---

## Troubleshooting

### Problem: "Port already in use"

**Error**: `Address already in use` or `Port 5000/3000 already in use`

**Solution**:

1. Find process using port:
   - **Windows**: `netstat -ano | findstr :5000`
   - **macOS/Linux**: `lsof -i :5000`
2. Kill process:
   - **Windows**: `taskkill /PID <PID> /F`
   - **macOS/Linux**: `kill -9 <PID>`
3. Or change port in code

### Problem: "ModuleNotFoundError: No module named 'keras'"

**Solution**:

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
```

### Problem: "npm ERR! request to https://registry.npmjs.org failed"

**Solution**:

```bash
npm cache clean --force
npm install
```

### Problem: "CORS error in frontend"

**Error**: `Access to XMLHttpRequest blocked by CORS`

**Solution**:

1. Ensure backend is running on port 5000
2. Check API URL in frontend: `http://localhost:5000`
3. Restart both servers

### Problem: "Current price shows as 'Loading...'"

**Solution**:

1. Check internet connection
2. Verify Yahoo Finance is accessible
3. Check backend logs for errors
4. Try manual API call: `curl http://localhost:5000/api/current-price`

### Problem: "Model file not found"

**Solution**:

1. Ensure `Bitcoin_Price_Prediction_Model.keras` exists in project root
2. Check file path in `backend/app.py`:
   ```python
   MODEL_PATH = os.path.join(os.path.dirname(__file__), '../Bitcoin_Price_Prediction_Model.keras')
   ```

### Problem: "Python/Node not found"

**Solution**:

1. **Install Python**: https://www.python.org/ (check "Add to PATH")
2. **Install Node.js**: https://nodejs.org/ (LTS version)
3. Restart terminal/command prompt after installation
4. Verify: `python --version` and `node --version`

---

## Next Steps

Once everything is running:

1. ✅ Test all prediction periods (Day, Week, Month)
2. ✅ Refresh current price
3. ✅ Review model information
4. ✅ Check historical data
5. ✅ Review prediction accuracy

---

## Support

For issues:

1. Check the troubleshooting section above
2. Review logs in both backend and frontend terminals
3. Ensure proper versions of Python and Node.js
4. Check API documentation: `http://localhost:5000/api/model-info`

---

## Production Deployment

For production deployment:

1. Build optimized frontend: `npm run build`
2. Use production Docker image
3. Configure environment variables
4. Set up HTTPS/SSL
5. Implement authentication
6. Set up monitoring and logging

See `README.md` for more details.

---

**CryptoVision © 2026 - Bitcoin Price Prediction Platform**
