import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:5000/api";

function App() {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [historicalData, setHistoricalData] = useState(null);

  // Fetch current price on component mount
  useEffect(() => {
    fetchCurrentPrice();
    fetchHistoricalData();
    const interval = setInterval(fetchCurrentPrice, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/current-price`);
      if (response.data.status === "success") {
        setCurrentPrice(response.data.price);
      }
    } catch (err) {
      console.error("Error fetching current price:", err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/historical?days=90`);
      if (response.data.status === "success") {
        setHistoricalData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching historical data:", err);
    }
  };

  const handlePredict = async (period) => {
    setLoading(true);
    setError(null);
    setSelectedPeriod(period);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, {
        period: period,
      });

      if (response.data.status === "success") {
        setPredictions(response.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch predictions. Ensure backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">₿</div>
            <div>
              <h1>CryptoVision</h1>
              <p className="tagline">Advanced Bitcoin Price Prediction</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container">
        {/* Current Price Card */}
        <section className="current-price-section">
          <div className="price-card">
            <h2>Current Bitcoin Price</h2>
            <div className="price-display">
              {currentPrice ? (
                <>
                  <span className="currency-symbol">$</span>
                  <span className="price-value">{currentPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="loading">Loading...</span>
              )}
            </div>
            <p className="timestamp">Updated live from market data</p>
          </div>
        </section>

        {/* Controls Section */}
        <section className="controls-section">
          <h2>Select Prediction Period</h2>
          <div className="button-group">
            <button
              className={`period-btn ${selectedPeriod === "day" ? "active" : ""}`}
              onClick={() => handlePredict("day")}
              disabled={loading}
            >
              📅 Next Day
            </button>
            <button
              className={`period-btn ${selectedPeriod === "week" ? "active" : ""}`}
              onClick={() => handlePredict("week")}
              disabled={loading}
            >
              📆 Next Week
            </button>
            <button
              className={`period-btn ${selectedPeriod === "month" ? "active" : ""}`}
              onClick={() => handlePredict("month")}
              disabled={loading}
            >
              📊 Next Month
            </button>
          </div>
          {loading && (
            <div className="loading-spinner">Generating predictions...</div>
          )}
        </section>

        {/* Error Display */}
        {error && (
          <section className="error-section">
            <div className="error-card">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          </section>
        )}

        {/* Predictions Display */}
        {predictions && (
          <section className="predictions-section">
            <h2>Price Predictions - {predictions.period.toUpperCase()}</h2>

            {/* Price Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Average Prediction</h3>
                <p className="stat-value">
                  {formatPrice(predictions.price_range.average)}
                </p>
              </div>
              <div className="stat-card">
                <h3>Lowest Prediction</h3>
                <p className="stat-value">
                  {formatPrice(predictions.price_range.min)}
                </p>
              </div>
              <div className="stat-card">
                <h3>Highest Prediction</h3>
                <p className="stat-value">
                  {formatPrice(predictions.price_range.max)}
                </p>
              </div>
              <div className="stat-card">
                <h3>Confidence Level</h3>
                <p className="stat-value">Medium-High</p>
              </div>
            </div>

            {/* Detailed Predictions Table */}
            <div className="predictions-table">
              <h3>Detailed Predictions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Predicted Price</th>
                    <th>vs Current</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.dates.map((date, index) => {
                    const predictedPrice = predictions.predictions[index];
                    const difference = predictedPrice - (currentPrice || 0);
                    const percentChange = currentPrice
                      ? (difference / currentPrice) * 100
                      : 0;

                    return (
                      <tr key={index}>
                        <td className="date-cell">{date}</td>
                        <td className="price-cell">
                          {formatPrice(predictedPrice)}
                        </td>
                        <td
                          className={`change-cell ${difference >= 0 ? "positive" : "negative"}`}
                        >
                          {difference >= 0 ? "📈" : "📉"}{" "}
                          {difference.toFixed(2)} ({percentChange.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Historical Data Info */}
        <section className="info-section">
          <div className="info-card">
            <h3>📚 Model Information</h3>
            <div className="info-content">
              <p>
                <strong>Model Type:</strong> LSTM Neural Network (4 layers)
              </p>
              <p>
                <strong>Input Window:</strong> 100 days of historical data
              </p>
              <p>
                <strong>Training Data:</strong> 2015-2026 (10+ years)
              </p>
              <p>
                <strong>Data Source:</strong> Yahoo Finance
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          CryptoVision © 2026 | Powered by LSTM Machine Learning | Predictions
          for educational purposes
        </p>
      </footer>
    </div>
  );
}

export default App;
