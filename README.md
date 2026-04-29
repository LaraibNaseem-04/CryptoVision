# 🚀 CryptoVision - Bitcoin Price Prediction Platform

![CryptoVision](https://img.shields.io/badge/CryptoVision-Bitcoin%20Prediction-orange?style=for-the-badge)
![LSTM](https://img.shields.io/badge/Model-LSTM%20Neural%20Network-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge)
![Flask](https://img.shields.io/badge/Backend-Flask-000000?style=for-the-badge)

CryptoVision is an advanced Bitcoin price prediction web application powered by a sophisticated LSTM (Long Short-Term Memory) neural network. The platform provides real-time price predictions for 1-day, 7-day, and 30-day timeframes.

## 📊 Features

- **Real-time BTC Price Updates**: Live Bitcoin price fetching from market data
- **AI-Powered Predictions**: LSTM neural network trained on 10+ years of historical data
- **Multiple Timeframes**: Predict for day, week, or month ahead
- **Interactive Dashboard**: Beautiful, responsive UI with modern design
- **Price Statistics**: Average, minimum, and maximum price predictions
- **Historical Data Visualization**: View past 90 days of Bitcoin history
- **Model Information**: Detailed information about the prediction model
- **Mobile Responsive**: Fully optimized for desktop and mobile devices

## 🏗️ Project Structure

```
cryptoPrediction/
├── Bitcoin_Price_Prediction_Model.keras    # Trained LSTM model
├── BTC_ML.ipynb                            # Training notebook
│
├── backend/
│   ├── app.py                              # Flask API server
│   ├── requirements.txt                    # Python dependencies
│   └── .env                                # Environment variables
│
└── frontend/
    ├── src/
    │   ├── App.jsx                         # Main React component
    │   ├── App.css                         # Styling
    │   └── main.jsx                        # Entry point
    ├── index.html                          # HTML template
    ├── package.json                        # Node dependencies
    ├── vite.config.js                      # Vite configuration
    └── .env                                # Frontend environment
```

## 🤖 Model Details

### Architecture

- **Type**: LSTM (Long Short-Term Memory) Neural Network
- **Layers**:
  - LSTM (50 units, activation=relu)
  - Dropout (0.2)
  - LSTM (60 units, activation=relu)
  - Dropout (0.3)
  - LSTM (80 units, activation=relu)
  - Dropout (0.4)
  - LSTM (120 units, activation=relu)
  - Dropout (0.5)
  - Dense (1 unit)

### Training Data

- **Source**: Yahoo Finance (BTC-USD)
- **Date Range**: 2015-01-01 to 2026-04-28
- **Total Records**: 4000+ days
- **Input Window**: 100 days of historical data
- **Optimizer**: Adam
- **Loss Function**: Mean Squared Error

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- pip (Python package manager)
- npm (Node package manager)

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Create a Python virtual environment**:

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:

   **Windows:**

   ```bash
   venv\Scripts\activate
   ```

   **macOS/Linux:**

   ```bash
   source venv/bin/activate
   ```

4. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file** (optional, for configuration):

   ```bash
   echo FLASK_ENV=development > .env
   echo FLASK_DEBUG=True >> .env
   ```

6. **Run the Flask server**:

   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):

   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   The application will open on `http://localhost:3000`

4. **Build for production** (optional):
   ```bash
   npm run build
   ```

## 📡 API Endpoints

### Health Check

```
GET http://localhost:5000/api/health
```

Response: Server status and timestamp

### Get Current Bitcoin Price

```
GET http://localhost:5000/api/current-price
```

Response:

```json
{
  "status": "success",
  "price": 42500.5,
  "currency": "USD",
  "timestamp": "2026-04-29T10:30:00"
}
```

### Get Price Predictions

```
POST http://localhost:5000/api/predict
Content-Type: application/json

{
  "period": "day" | "week" | "month"
}
```

Response:

```json
{
  "status": "success",
  "current_price": 42500.50,
  "predictions": [42650.25, 42800.10, ...],
  "dates": ["2026-04-30", "2026-05-01", ...],
  "period": "day",
  "price_range": {
    "min": 42100.00,
    "max": 43200.00,
    "average": 42650.00
  },
  "confidence": "Medium-High"
}
```

### Get Historical Data

```
GET http://localhost:5000/api/historical?days=90
```

### Get Model Information

```
GET http://localhost:5000/api/model-info
```

## 🎨 User Interface

### Dashboard Components

1. **Header**: CryptoVision branding with logo
2. **Current Price Card**: Real-time BTC price display
3. **Control Panel**: Period selection buttons (Day/Week/Month)
4. **Statistics Grid**: Average, min, max, and confidence metrics
5. **Predictions Table**: Detailed price predictions with dates and changes
6. **Model Info**: Technical details about the prediction model

## 📈 How Predictions Work

1. **Data Collection**: Fetches last 400 days of BTC historical data
2. **Data Preprocessing**: Normalizes data using MinMaxScaler (0-1 range)
3. **Sequence Creation**: Creates 100-day rolling windows for predictions
4. **Model Inference**: LSTM model processes sequences and outputs predictions
5. **Inverse Transform**: Converts normalized predictions back to actual prices
6. **Display**: Shows predictions with dates and statistics

## ⚙️ Configuration

### Backend (.env)

```
FLASK_ENV=development
FLASK_DEBUG=True
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Issue: "Failed to fetch predictions"

- **Solution**: Ensure backend server is running on port 5000
- Check: `http://localhost:5000/api/health`

### Issue: "CORS errors"

- **Solution**: Backend CORS is already configured
- Ensure backend is running before frontend

### Issue: "Module not found errors"

- **Solution**: Reinstall dependencies
  ```bash
  pip install -r requirements.txt  # Backend
  npm install                       # Frontend
  ```

### Issue: "Model file not found"

- **Solution**: Ensure `Bitcoin_Price_Prediction_Model.keras` is in the project root
- Verify the model path in `backend/app.py`

## 📊 Performance Considerations

- Model prediction time: ~100-500ms per request
- Historical data fetch: ~1-2 seconds
- Recommended: Cache predictions for 30-60 minutes
- API rate limiting: Consider implementing for production

## 🔐 Security Notes

- Current setup is for development/demonstration
- For production:
  - Add authentication/authorization
  - Implement rate limiting
  - Use HTTPS/SSL
  - Add input validation
  - Secure API keys and credentials

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

**CryptoVision** - Bitcoin Price Prediction Platform
Built with ❤️ using LSTM Neural Networks

## 📧 Support

For issues, questions, or suggestions, please refer to the project documentation or create an issue in the repository.

## 🎯 Future Enhancements

- [ ] Multiple cryptocurrency support (ETH, XRP, etc.)
- [ ] Advanced chart visualizations
- [ ] User authentication and saved predictions
- [ ] Email notifications for price alerts
- [ ] Mobile app (React Native)
- [ ] WebSocket real-time updates
- [ ] Model performance metrics dashboard
- [ ] Historical prediction accuracy analysis

---

**Note**: These predictions are for educational and informational purposes only. Cryptocurrency markets are highly volatile and unpredictable. Always conduct your own research before making investment decisions.
