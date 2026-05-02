"""
CryptoVision backend for Bitcoin, Ethereum, and XRP price predictions.
"""

import os
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import yfinance as yf
from flask import Flask, jsonify, request
from flask_cors import CORS
from keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)
CORS(app)

BASE_DAYS = 100
VALID_PERIODS = {
    "day": 1,
    "week": 7,
    "month": 30,
}

ASSETS = {
    "bitcoin": {
        "id": "bitcoin",
        "name": "Bitcoin",
        "symbol": "BTC",
        "ticker": "BTC-USD",
        "model_path": "../Bitcoin_Price_Prediction_Model.keras",
        "accent": "#f7931a",
        "training_range": "2015-01-01 to 2026-04-28",
    },
    "ethereum": {
        "id": "ethereum",
        "name": "Ethereum",
        "symbol": "ETH",
        "ticker": "ETH-USD",
        "model_path": "../Etherium_Price_Prediction_Model.keras",
        "accent": "#627eea",
        "training_range": "2017-01-01 to 2026-05-02",
    },
    "xrp": {
        "id": "xrp",
        "name": "XRP",
        "symbol": "XRP",
        "ticker": "XRP-USD",
        "model_path": "../Ripple_Price_Prediction_Model.keras",
        "accent": "#23292f",
        "training_range": "2017-01-01 to 2026-05-02",
    },
}


def load_models():
    """Load every available trained model at startup."""
    models = {}
    base_dir = os.path.dirname(__file__)

    for asset_id, asset in ASSETS.items():
        model_path = os.path.join(base_dir, asset["model_path"])
        models[asset_id] = load_model(model_path)

    return models


MODELS = load_models()


def serialize_asset(asset):
    """Return only the frontend-safe asset metadata."""
    return {
        "id": asset["id"],
        "name": asset["name"],
        "symbol": asset["symbol"],
        "ticker": asset["ticker"],
        "accent": asset["accent"],
    }


def resolve_asset(asset_value):
    """Resolve an asset using id, symbol, or ticker."""
    if not asset_value:
        return ASSETS["bitcoin"]

    normalized = str(asset_value).strip().lower()

    for asset in ASSETS.values():
        if normalized in {
            asset["id"].lower(),
            asset["name"].lower(),
            asset["symbol"].lower(),
            asset["ticker"].lower(),
        }:
            return asset

    return None


def fetch_asset_data(ticker, start_date=None, end_date=None, period=None):
    """Fetch historical data for an asset from Yahoo Finance."""
    try:
        if period:
            data = yf.download(ticker, period=period, progress=False, auto_adjust=False)
        else:
            data = yf.download(
                ticker,
                start=start_date,
                end=end_date,
                progress=False,
                auto_adjust=False,
            )

        if data is None or data.empty:
            return None

        close_series = data["Close"]
        if isinstance(close_series, pd.DataFrame):
            close_series = close_series.iloc[:, 0]

        prepared = close_series.reset_index()
        prepared.columns = ["Date", "Close"]
        prepared = prepared.dropna()
        return prepared
    except Exception as exc:
        print(f"Error fetching data for {ticker}: {exc}")
        return None


def prepare_data(df):
    """Prepare and scale data for model prediction."""
    try:
        close_prices = df["Close"].astype(float).values.reshape(-1, 1)
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(close_prices)
        return scaler, scaled_data, close_prices
    except Exception as exc:
        print(f"Error preparing data: {exc}")
        return None, None, None


def predict_price(model, latest_data, days_to_predict):
    """Predict future price for the specified number of days."""
    predictions = []
    current_sequence = latest_data[-BASE_DAYS:].copy()

    for _ in range(days_to_predict):
        prediction_input = current_sequence.reshape(1, BASE_DAYS, 1)
        predicted_scaled = model.predict(prediction_input, verbose=0)[0][0]
        predictions.append(predicted_scaled)
        current_sequence = np.append(
            current_sequence[1:],
            [[predicted_scaled]],
            axis=0,
        )

    return np.array(predictions)


def inverse_transform_predictions(scaler, scaled_predictions):
    """Convert scaled predictions back to actual prices."""
    dummy_array = np.zeros((len(scaled_predictions), 1))
    dummy_array[:, 0] = scaled_predictions
    actual_predictions = scaler.inverse_transform(dummy_array)
    return actual_predictions.flatten()


def get_current_price(ticker):
    """Get the current price for an asset."""
    try:
        current_data = fetch_asset_data(ticker, period="5d")
        if current_data is None or current_data.empty:
            return None
        return float(current_data["Close"].iloc[-1])
    except Exception as exc:
        print(f"Error getting current price for {ticker}: {exc}")
        return None


@app.route("/api/assets", methods=["GET"])
def list_assets():
    """List supported assets."""
    return jsonify(
        {
            "status": "success",
            "assets": [serialize_asset(asset) for asset in ASSETS.values()],
            "default_asset": "bitcoin",
        }
    ), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "success",
            "message": "CryptoVision backend is running",
            "timestamp": datetime.now().isoformat(),
            "assets_loaded": list(ASSETS.keys()),
        }
    )


@app.route("/api/predict", methods=["POST"])
def predict():
    """Prediction endpoint for supported assets."""
    try:
        data = request.get_json(silent=True) or {}
        period = str(data.get("period", "day")).lower()
        asset = resolve_asset(data.get("asset", "bitcoin"))

        if asset is None:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Invalid asset. Use one of: {", ".join(ASSETS.keys())}',
                }
            ), 400

        if period not in VALID_PERIODS:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Invalid period. Use: {", ".join(VALID_PERIODS.keys())}',
                }
            ), 400

        end_date = datetime.now()
        start_date = end_date - timedelta(days=400)
        historical_data = fetch_asset_data(asset["ticker"], start_date=start_date, end_date=end_date)

        if historical_data is None:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Failed to fetch historical data for {asset["name"]}',
                }
            ), 500

        scaler, scaled_data, original_prices = prepare_data(historical_data)
        if scaled_data is None or len(scaled_data) < BASE_DAYS:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Not enough historical data to predict {asset["name"]}',
                }
            ), 500

        days_to_predict = VALID_PERIODS[period]
        scaled_predictions = predict_price(MODELS[asset["id"]], scaled_data, days_to_predict)
        actual_predictions = inverse_transform_predictions(scaler, scaled_predictions)

        last_date = pd.to_datetime(historical_data["Date"].iloc[-1])
        future_dates = [
            (last_date + timedelta(days=offset + 1)).strftime("%Y-%m-%d")
            for offset in range(days_to_predict)
        ]

        current_price = get_current_price(asset["ticker"])
        price_range = {
            "min": float(np.min(actual_predictions)),
            "max": float(np.max(actual_predictions)),
            "average": float(np.mean(actual_predictions)),
        }

        return jsonify(
            {
                "status": "success",
                "asset": serialize_asset(asset),
                "current_price": float(current_price) if current_price is not None else None,
                "predictions": actual_predictions.tolist(),
                "dates": future_dates,
                "period": period,
                "price_range": price_range,
                "confidence": "Medium-High (Based on 100+ days historical LSTM analysis)",
                "message": f'{asset["name"]} {period} prediction generated successfully',
            }
        ), 200

    except Exception as exc:
        print(f"Prediction error: {exc}")
        return jsonify(
            {
                "status": "error",
                "message": f"Prediction failed: {exc}",
            }
        ), 500


@app.route("/api/current-price", methods=["GET"])
def current_price():
    """Get the current price for an asset."""
    try:
        asset = resolve_asset(request.args.get("asset", "bitcoin"))
        if asset is None:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Invalid asset. Use one of: {", ".join(ASSETS.keys())}',
                }
            ), 400

        price = get_current_price(asset["ticker"])
        if price is None:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Failed to fetch current price for {asset["name"]}',
                }
            ), 500

        return jsonify(
            {
                "status": "success",
                "asset": serialize_asset(asset),
                "price": price,
                "currency": "USD",
                "timestamp": datetime.now().isoformat(),
            }
        ), 200

    except Exception as exc:
        return jsonify(
            {
                "status": "error",
                "message": str(exc),
            }
        ), 500


@app.route("/api/historical", methods=["GET"])
def historical_data():
    """Get historical asset data for the selected chart range."""
    try:
        asset = resolve_asset(request.args.get("asset", "bitcoin"))
        if asset is None:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Invalid asset. Use one of: {", ".join(ASSETS.keys())}',
                }
            ), 400

        days = request.args.get("days", 90, type=int)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        data = fetch_asset_data(asset["ticker"], start_date=start_date, end_date=end_date)

        if data is None:
            return jsonify(
                {
                    "status": "error",
                    "message": f'Failed to fetch historical data for {asset["name"]}',
                }
            ), 500

        data["Date"] = pd.to_datetime(data["Date"]).dt.strftime("%Y-%m-%d")

        return jsonify(
            {
                "status": "success",
                "asset": serialize_asset(asset),
                "data": data.to_dict(orient="records"),
                "message": f'Historical data for {asset["name"]} for the last {days} days',
            }
        ), 200

    except Exception as exc:
        return jsonify(
            {
                "status": "error",
                "message": str(exc),
            }
        ), 500


@app.route("/api/model-info", methods=["GET"])
def model_info():
    """Get model information for a selected asset."""
    asset = resolve_asset(request.args.get("asset", "bitcoin"))
    if asset is None:
        return jsonify(
            {
                "status": "error",
                "message": f'Invalid asset. Use one of: {", ".join(ASSETS.keys())}',
            }
        ), 400

    return jsonify(
        {
            "status": "success",
            "project_name": "CryptoVision",
            "project_description": f'Advanced {asset["name"]} price prediction using LSTM neural networks',
            "asset": serialize_asset(asset),
            "supported_assets": [serialize_asset(item) for item in ASSETS.values()],
            "model_type": "LSTM (Long Short-Term Memory)",
            "model_architecture": {
                "layers": [
                    "LSTM (50 units, activation=relu)",
                    "Dropout (0.2)",
                    "LSTM (60 units, activation=relu)",
                    "Dropout (0.3)",
                    "LSTM (80 units, activation=relu)",
                    "Dropout (0.4)",
                    "LSTM (120 units, activation=relu)",
                    "Dropout (0.5)",
                    "Dense (1 unit)",
                ],
                "input_window": f"{BASE_DAYS} days",
                "optimizer": "Adam",
                "loss_function": "Mean Squared Error",
            },
            "training_data": {
                "source": f'Yahoo Finance ({asset["ticker"]})',
                "date_range": asset["training_range"],
                "total_records": "1000+ daily records",
            },
            "prediction_capabilities": ["Day", "Week", "Month"],
            "version": "2.0.0",
        }
    ), 200


if __name__ == "__main__":
    print("=" * 60)
    print("CryptoVision - Multi-Asset Price Prediction Backend")
    print("=" * 60)
    print("Starting Flask server...")
    print("Supported assets:", ", ".join(asset["symbol"] for asset in ASSETS.values()))
    print("API documentation: http://localhost:5000/api/model-info")
    print("=" * 60)

    app.run(debug=True, host="0.0.0.0", port=5000)
