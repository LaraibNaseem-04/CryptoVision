import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const API_BASE_URL = "http://localhost:5000/api";

const PERIOD_OPTIONS = [
  { id: "day", label: "Next Day", helper: "1-day forecast" },
  { id: "week", label: "Next Week", helper: "7-day forecast" },
  { id: "month", label: "Next Month", helper: "30-day forecast" },
];

const ASSET_ICONS = {
  bitcoin: "BTC",
  ethereum: "ETH",
  xrp: "XRP",
};

const HISTORY_LINE_COLOR = "#38bdf8";
const PREDICTION_LINE_COLOR = "#f97316";
const PREDICTION_AREA_COLOR = "rgba(249, 115, 22, 0.18)";

function App() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("bitcoin");
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/assets`);
        if (response.data.status === "success") {
          setAssets(response.data.assets);
          setSelectedAsset(response.data.default_asset || response.data.assets[0]?.id || "bitcoin");
        } else {
          setError("Failed to load supported currencies.");
        }
      } catch (err) {
        setError("Failed to connect to the backend. Ensure Flask is running on port 5000.");
      } finally {
        setBootstrapping(false);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    if (!selectedAsset) {
      return undefined;
    }

    setPredictions(null);
    fetchCurrentPrice(selectedAsset);
    fetchHistoricalData(selectedAsset);

    const interval = setInterval(() => {
      fetchCurrentPrice(selectedAsset);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  const selectedAssetMeta =
    assets.find((asset) => asset.id === selectedAsset) || assets[0] || null;

  const fetchCurrentPrice = async (assetId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/current-price`, {
        params: { asset: assetId },
      });

      if (response.data.status === "success") {
        setCurrentPrice(response.data.price);
      }
    } catch (err) {
      console.error("Error fetching current price:", err);
    }
  };

  const fetchHistoricalData = async (assetId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/historical`, {
        params: { asset: assetId, days: 90 },
      });

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
        asset: selectedAsset,
        period,
      });

      if (response.data.status === "success") {
        setPredictions(response.data);
        if (typeof response.data.current_price === "number") {
          setCurrentPrice(response.data.current_price);
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate predictions. Ensure backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

  const formatCompactPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(price);

  const assetHistoryHigh =
    historicalData.length > 0
      ? Math.max(...historicalData.map((item) => Number(item.Close)))
      : null;

  const assetHistoryLow =
    historicalData.length > 0
      ? Math.min(...historicalData.map((item) => Number(item.Close)))
      : null;

  const chartData = [
    ...historicalData.map((item) => ({
      date: item.Date,
      previousPrice: Number(item.Close),
      predictedPrice: null,
    })),
    ...(predictions
      ? predictions.dates.map((date, index) => ({
          date,
          previousPrice: null,
          predictedPrice: Number(predictions.predictions[index]),
        }))
      : []),
  ];

  const predictionStartDate = predictions?.dates?.[0] || null;
  const predictionEndDate =
    predictions?.dates?.[predictions.dates.length - 1] || null;

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-copy">
            <div className="eyebrow">Multi-asset forecasting dashboard</div>
            <h1 className="brand-title">
              <span className="brand-title-main">CryptoVision</span>
              <span className="brand-title-glow">CryptoVision</span>
            </h1>
            <p className="tagline">
              Explore day, week, and month predictions for Bitcoin, Ethereum, and XRP.
            </p>
          </div>
          <div className="hero-badge">
            <span className="hero-badge-label">Live coverage</span>
            <strong>BTC + ETH + XRP</strong>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="asset-section">
          <div className="section-heading">
            <h2>Select Currency</h2>
            <p>Switch assets to refresh the live price, historical snapshot, and forecast horizon.</p>
          </div>

          <div className="asset-grid">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={`asset-card ${selectedAsset === asset.id ? "active" : ""}`}
                onClick={() => setSelectedAsset(asset.id)}
                style={{ "--asset-accent": asset.accent }}
              >
                <span className="asset-icon">{ASSET_ICONS[asset.id] || asset.symbol}</span>
                <span className="asset-name">{asset.name}</span>
                <span className="asset-symbol">{asset.ticker}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="overview-section"
          style={{ "--asset-accent": selectedAssetMeta?.accent || "#f7931a" }}
        >
          <div className="price-card">
            <p className="card-label">
              Current {selectedAssetMeta?.name || "Crypto"} Price
            </p>
            <div className="price-display">
              {currentPrice !== null ? (
                <span className="price-value">{formatPrice(currentPrice)}</span>
              ) : (
                <span className="loading">Loading live price...</span>
              )}
            </div>
            <p className="timestamp">Updated from Yahoo Finance market data</p>
          </div>

          <div className="market-card">
            <p className="card-label">90-Day Snapshot</p>
            <div className="market-stats">
              <div>
                <span className="market-stat-label">High</span>
                <strong>{assetHistoryHigh ? formatCompactPrice(assetHistoryHigh) : "--"}</strong>
              </div>
              <div>
                <span className="market-stat-label">Low</span>
                <strong>{assetHistoryLow ? formatCompactPrice(assetHistoryLow) : "--"}</strong>
              </div>
              <div>
                <span className="market-stat-label">Records</span>
                <strong>{historicalData.length || 0} days</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="controls-section">
          <div className="section-heading">
            <h2>Choose Prediction Window</h2>
            <p>Each forecast uses the same LSTM pipeline and the latest 100-day sequence.</p>
          </div>

          <div className="button-group">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`period-btn ${selectedPeriod === option.id ? "active" : ""}`}
                onClick={() => handlePredict(option.id)}
                disabled={loading || bootstrapping}
              >
                <span>{option.label}</span>
                <small>{option.helper}</small>
              </button>
            ))}
          </div>

          {loading && <div className="loading-spinner">Generating {selectedPeriod} forecast...</div>}
        </section>

        {error && (
          <section className="error-section">
            <div className="error-card">
              <span className="error-icon">!</span>
              <p>{error}</p>
            </div>
          </section>
        )}

        {predictions && (
          <section
            className="predictions-section"
            style={{ "--asset-accent": predictions.asset.accent }}
          >
            <div className="section-heading">
              <h2>
                {predictions.asset.name} {predictions.period} prediction
              </h2>
              <p>{predictions.confidence}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Average Prediction</h3>
                <p className="stat-value">{formatPrice(predictions.price_range.average)}</p>
              </div>
              <div className="stat-card">
                <h3>Lowest Prediction</h3>
                <p className="stat-value">{formatPrice(predictions.price_range.min)}</p>
              </div>
              <div className="stat-card">
                <h3>Highest Prediction</h3>
                <p className="stat-value">{formatPrice(predictions.price_range.max)}</p>
              </div>
              <div className="stat-card">
                <h3>Current Market</h3>
                <p className="stat-value">
                  {predictions.current_price ? formatPrice(predictions.current_price) : "--"}
                </p>
              </div>
            </div>

            <div className="predictions-table">
              <h3>Detailed Forecast</h3>
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
                    const referencePrice = predictions.current_price || 0;
                    const difference = predictedPrice - referencePrice;
                    const percentChange =
                      referencePrice > 0 ? (difference / referencePrice) * 100 : 0;

                    return (
                      <tr key={date}>
                        <td className="date-cell">{date}</td>
                        <td className="price-cell">{formatPrice(predictedPrice)}</td>
                        <td
                          className={`change-cell ${difference >= 0 ? "positive" : "negative"}`}
                        >
                          {difference >= 0 ? "Up" : "Down"} {formatPrice(Math.abs(difference))} (
                          {percentChange.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="forecast-chart-card">
              <div className="chart-header">
                <h3>Price Trend and Forecast</h3>
                <div className="chart-legend-inline">
                  <span className="legend-pill">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: HISTORY_LINE_COLOR }}
                    />
                    Previous price
                  </span>
                  <span className="legend-pill">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: PREDICTION_LINE_COLOR }}
                    />
                    Predicted price
                  </span>
                  <span className="legend-pill">
                    <span className="legend-swatch" />
                    Forecast zone
                  </span>
                </div>
              </div>

              <div className="chart-shell">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="rgba(159, 176, 200, 0.14)" vertical={false} />
                    {predictionStartDate && predictionEndDate ? (
                      <ReferenceArea
                        x1={predictionStartDate}
                        x2={predictionEndDate}
                        fill={PREDICTION_AREA_COLOR}
                        fillOpacity={1}
                        ifOverflow="extendDomain"
                      />
                    ) : null}
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9fb0c8", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fill: "#9fb0c8", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCompactPrice(value)}
                      width={72}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#10253e",
                        border: "1px solid rgba(159, 176, 200, 0.2)",
                        borderRadius: "14px",
                        color: "#f8fafc",
                      }}
                      formatter={(value) => (value ? formatPrice(value) : "--")}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="predictedPrice"
                      name="Forecast area"
                      stroke="none"
                      fill={PREDICTION_AREA_COLOR}
                      fillOpacity={1}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                      legendType="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="previousPrice"
                      name="Previous price"
                      stroke={HISTORY_LINE_COLOR}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedPrice"
                      name="Predicted price"
                      stroke={PREDICTION_LINE_COLOR}
                      strokeWidth={3}
                      dot={{ r: 2.5, fill: PREDICTION_LINE_COLOR, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      connectNulls={false}
                      isAnimationActive
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        <section className="info-section">
          <div className="info-card">
            <div className="section-heading">
              <h2>Model Information</h2>
              <p>Shared forecasting engine across all supported currencies.</p>
            </div>
            <div className="info-content">
              <p>
                <strong>Model Type:</strong> Multi-layer LSTM neural network
              </p>
              <p>
                <strong>Prediction Windows:</strong> Day, week, and month
              </p>
              <p>
                <strong>Input Window:</strong> 100 days of historical prices
              </p>
              <p>
                <strong>Tracked Assets:</strong> Bitcoin, Ethereum, and XRP
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>CryptoVision 2026 | LSTM-based crypto forecasts for educational purposes</p>
      </footer>
    </div>
  );
}

export default App;
