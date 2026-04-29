# 🚀 CryptoVision - Quick Reference Card

Save this for quick access!

## ⚡ Quick Commands

### Windows

```bash
# Navigate to project
cd C:\Users\YourUsername\Desktop\cryptoPrediction

# Run everything
start.bat

# Or manually:
# Terminal 1 - Backend
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### macOS/Linux

```bash
# Navigate to project
cd ~/Desktop/cryptoPrediction

# Run everything
chmod +x start.sh
./start.sh

# Or manually:
# Terminal 1 - Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Docker

```bash
cd cryptoPrediction
docker-compose up --build
```

---

## 🌐 URLs

| Service       | URL                                     | Purpose        |
| ------------- | --------------------------------------- | -------------- |
| Frontend      | http://localhost:3000                   | User Interface |
| Backend API   | http://localhost:5000                   | REST API       |
| Health Check  | http://localhost:5000/api/health        | API Status     |
| Current Price | http://localhost:5000/api/current-price | BTC Price      |
| Model Info    | http://localhost:5000/api/model-info    | Model Details  |

---

## 📡 API Endpoints

### Predict Price

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"period": "day"}'

# period: "day" | "week" | "month"
```

### Get Current Price

```bash
curl http://localhost:5000/api/current-price
```

### Get Historical Data

```bash
curl http://localhost:5000/api/historical?days=90
```

### Get Model Info

```bash
curl http://localhost:5000/api/model-info
```

---

## 📂 Important Files

| File                                   | Purpose            |
| -------------------------------------- | ------------------ |
| `backend/app.py`                       | Flask API          |
| `frontend/src/App.jsx`                 | React Component    |
| `frontend/src/App.css`                 | Styling            |
| `Bitcoin_Price_Prediction_Model.keras` | ML Model           |
| `README.md`                            | Full Documentation |
| `SETUP_GUIDE.md`                       | Setup Instructions |

---

## 🔥 Features

✅ Real-time BTC prices  
✅ LSTM predictions (Day/Week/Month)  
✅ Beautiful responsive UI  
✅ Model info endpoint  
✅ Historical data  
✅ Error handling  
✅ CORS enabled

---

## 🛠️ Key Technologies

- **Backend**: Flask + Keras/TensorFlow
- **Frontend**: React + Vite
- **Data**: Pandas, NumPy, scikit-learn
- **Source**: Yahoo Finance API
- **Deployment**: Docker + Docker Compose

---

## ⚙️ Configuration Files

### Backend `.env`

```
FLASK_ENV=development
FLASK_DEBUG=True
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🚨 Common Issues

| Issue               | Solution                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| Port already in use | Kill process: `taskkill /PID <PID> /F` (Windows) or `kill -9 <PID>` (Mac/Linux) |
| Module not found    | Reinstall: `pip install -r requirements.txt` or `npm install`                   |
| CORS error          | Ensure backend runs on port 5000                                                |
| Model not found     | Check `Bitcoin_Price_Prediction_Model.keras` exists in root                     |
| No current price    | Check internet connection and Yahoo Finance access                              |

---

## 📊 Prediction Logic

1. Fetch last 400 days of BTC data
2. Normalize data (MinMaxScaler)
3. Create 100-day input sequences
4. Run through LSTM model
5. Get predictions for N days
6. Denormalize to actual prices
7. Return with statistics

---

## 📈 Model Details

- **Type**: LSTM Neural Network
- **Layers**: 4 LSTM layers (50/60/80/120 units)
- **Dropout**: 0.2 - 0.5
- **Input**: 100 days
- **Optimizer**: Adam
- **Loss**: MSE

---

## 🎯 Next After Setup

1. ✅ Verify both servers running
2. ✅ Test all prediction periods
3. ✅ Check current price updates
4. ✅ Review model information
5. ✅ Check responsive design
6. ✅ Deploy to production (optional)

---

## 📞 Help

- **Setup Issues?** → `SETUP_GUIDE.md`
- **What's Built?** → `BUILD_SUMMARY.md`
- **Verify Setup?** → `VERIFICATION_CHECKLIST.md`
- **Full Docs?** → `README.md`

---

## 🎓 Learn More

- **Frontend Logic**: See `frontend/src/App.jsx` (commented code)
- **Backend Logic**: See `backend/app.py` (commented code)
- **Model Training**: See `BTC_ML.ipynb` notebook
- **Styling**: See `frontend/src/App.css` (CSS variables)

---

## 📌 Remember

✨ **You built a fully functional ML prediction app!**

Frontend: React + Beautiful CSS  
Backend: Flask + LSTM Model  
Data: Real-time from Yahoo Finance  
Predictions: Day/Week/Month ahead

🚀 Ready to launch!

---

**Quick Start**: Run `start.bat` (Windows) or `./start.sh` (Mac/Linux)  
**Open Browser**: http://localhost:3000  
**Made with ❤️**: CryptoVision © 2026
