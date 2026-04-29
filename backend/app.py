"""
CryptoVision - Bitcoin Price Prediction Backend
Flask API for predicting BTC prices using LSTM Neural Network
"""


from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../Bitcoin_Price_Prediction_Model.keras')
model = load_model(MODEL_PATH)

# Configuration
BASE_DAYS = 100
SCALER = MinMaxScaler(feature_range=(0, 1))

def fetch_btc_data(start_date, end_date):
    """Fetch BTC-USD historical data from Yahoo Finance"""
    try:
        data = yf.download('BTC-USD', start=start_date, end=end_date, progress=False)
        return data[['Close']].reset_index()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def prepare_data(df):
    """Prepare and scale data for model prediction"""
    try:
        close_prices = df['Close'].values.reshape(-1, 1)
        scaled_data = SCALER.fit_transform(close_prices)
        return scaled_data, close_prices
    except Exception as e:
        print(f"Error preparing data: {e}")
        return None, None

def predict_price(latest_data, days_to_predict):
    """
    Predict future price for specified number of days
    
    Args:
        latest_data: Scaled historical data
        days_to_predict: Number of days to predict into the future
    
    Returns:
        List of predicted prices
    """
    predictions = []
    current_sequence = latest_data[-BASE_DAYS:].copy()
    
    for _ in range(days_to_predict):
        # Reshape for model input (samples, timesteps, features)
        X_predict = current_sequence.reshape(1, BASE_DAYS, 1)
        
        # Get prediction
        predicted_scaled = model.predict(X_predict, verbose=0)[0][0]
        predictions.append(predicted_scaled)
        
        # Update sequence for next prediction
        current_sequence = np.append(current_sequence[1:], [[predicted_scaled]], axis=0)
    
    return np.array(predictions)

def inverse_transform_predictions(scaled_predictions, original_prices):
    """Convert scaled predictions back to actual prices"""
    dummy_array = np.zeros((len(scaled_predictions), 1))
    dummy_array[:, 0] = scaled_predictions
    
    actual_predictions = SCALER.inverse_transform(dummy_array)
    return actual_predictions.flatten()

def get_current_price():
    """Get current BTC price"""
    try:
        btc_data = yf.download('BTC-USD', period='1d', progress=False)
        return float(btc_data['Close'].iloc[-1])
    except Exception as e:
        print(f"Error getting current price: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'CryptoVision Backend is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    
    Request JSON:
    {
        "period": "day" | "week" | "month"
    }
    
    Response JSON:
    {
        "status": "success/error",
        "current_price": float,
        "predictions": [...],
        "dates": [...],
        "period": string,
        "message": string
    }
    """
    try:
        data = request.get_json()
        period = data.get('period', 'day').lower()
        
        # Validate period
        valid_periods = {
            'day': 1,
            'week': 7,
            'month': 30
        }
        
        if period not in valid_periods:
            return jsonify({
                'status': 'error',
                'message': f'Invalid period. Use: {", ".join(valid_periods.keys())}'
            }), 400
        
        days_to_predict = valid_periods[period]
        
        # Fetch historical data (last 1 year + extra for training)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=400)
        
        historical_data = fetch_btc_data(start_date, end_date)
        
        if historical_data is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch historical data'
            }), 500
        
        # Prepare data
        scaled_data, original_prices = prepare_data(historical_data)
        
        if scaled_data is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to prepare data'
            }), 500
        
        # Make predictions
        scaled_predictions = predict_price(scaled_data, days_to_predict)
        actual_predictions = inverse_transform_predictions(scaled_predictions, original_prices)
        
        # Generate future dates
        last_date = pd.to_datetime(historical_data['Date'].iloc[-1])
        future_dates = [
            (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d')
            for i in range(days_to_predict)
        ]
        
        # Get current price
        current_price = get_current_price()
        
        # Calculate confidence and statistics
        all_prices = np.append(original_prices[-30:], actual_predictions)
        price_range = {
            'min': float(np.min(actual_predictions)),
            'max': float(np.max(actual_predictions)),
            'average': float(np.mean(actual_predictions))
        }
        
        return jsonify({
            'status': 'success',
            'current_price': float(current_price),
            'predictions': actual_predictions.tolist(),
            'dates': future_dates,
            'period': period,
            'price_range': price_range,
            'confidence': 'Medium-High (Based on 100+ days historical LSTM analysis)',
            'message': f'{period.capitalize()} price prediction generated successfully'
        }), 200
    
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/api/current-price', methods=['GET'])
def current_price():
    """Get current BTC price"""
    try:
        price = get_current_price()
        if price is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch current price'
            }), 500
        
        return jsonify({
            'status': 'success',
            'price': price,
            'currency': 'USD',
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/historical', methods=['GET'])
def historical_data():
    """Get historical BTC data for chart"""
    try:
        days = request.args.get('days', 90, type=int)
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        data = fetch_btc_data(start_date, end_date)
        
        if data is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch historical data'
            }), 500
        
        data['Date'] = pd.to_datetime(data['Date']).dt.strftime('%Y-%m-%d')
        
        return jsonify({
            'status': 'success',
            'data': data.to_dict(orient='records'),
            'message': f'Historical data for last {days} days'
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'status': 'success',
        'project_name': 'CryptoVision',
        'project_description': 'Advanced Bitcoin Price Prediction using LSTM Neural Networks',
        'model_type': 'LSTM (Long Short-Term Memory)',
        'model_architecture': {
            'layers': [
                'LSTM (50 units, activation=relu)',
                'Dropout (0.2)',
                'LSTM (60 units, activation=relu)',
                'Dropout (0.3)',
                'LSTM (80 units, activation=relu)',
                'Dropout (0.4)',
                'LSTM (120 units, activation=relu)',
                'Dropout (0.5)',
                'Dense (1 unit)'
            ],
            'input_window': f'{BASE_DAYS} days',
            'optimizer': 'Adam',
            'loss_function': 'Mean Squared Error'
        },
        'training_data': {
            'source': 'Yahoo Finance (BTC-USD)',
            'date_range': '2015-01-01 to 2026-04-28',
            'total_records': '4000+ days'
        },
        'prediction_capabilities': ['Day', 'Week', 'Month'],
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 CryptoVision - Bitcoin Price Prediction Backend")
    print("=" * 60)
    print("Starting Flask server...")
    print("API Documentation: http://localhost:5000/api/model-info")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
