import { useState } from "react";
import "../pages/Dashboard.css";

const BASE = "http://localhost:5000";
const DAYS = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
const COMMODITIES = [
  "Potato",
  "Wheat",
  "Tomato",
  "Onion",
  "Banana",
  "Orange",
  "Rice",
  "Maize",
  "Mustard",
];
const STATES = [
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Rajasthan",
  "Jammu and Kashmir",
];
const DISTRICTS = {
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Khanna",
    "Jammu",
  ],
  Haryana: ["Gurugram", "Hisar", "Rohtak", "Panipat"],
  "Uttar Pradesh": ["Lucknow", "Agra", "Kanpur", "Varanasi"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
};

export default function PriceForecast() {
  const [form, setForm] = useState({
    commodity: "Potato",
    state: "Punjab",
    district: "Ludhiana",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeMarket, setActiveMarket] = useState(null);

  const handle = (k, v) => {
    const update = { ...form, [k]: v };
    if (k === "state") update.district = DISTRICTS[v]?.[0] || "";
    setForm(update);
  };

  const fetchForecast = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`${BASE}/api/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Forecast failed");
      setData(json);
      setActiveMarket(Object.keys(json.forecast)[0]);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const markets = data ? Object.keys(data.forecast) : [];
  const prices = activeMarket && data ? data.forecast[activeMarket] : [];
  const rec = data?.recommendation;

  const getDates = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    });
  };
  const dates = getDates();

  return (
    <div>
      <div className="page-header">
        <h1>📊 Price Forecast</h1>
        <p>AI-powered 7-day price prediction for your commodity</p>
      </div>

      {/* FORM */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">🔍 Select Commodity & Location</div>
        <div className="three-col" style={{ marginBottom: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Commodity</label>
            <select
              className="form-select"
              value={form.commodity}
              onChange={(e) => handle("commodity", e.target.value)}
            >
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <select
              className="form-select"
              value={form.state}
              onChange={(e) => handle("state", e.target.value)}
            >
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">District</label>
            <select
              className="form-select"
              value={form.district}
              onChange={(e) => handle("district", e.target.value)}
            >
              {(DISTRICTS[form.state] || []).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchForecast}
          disabled={loading}
        >
          {loading ? "⏳ Fetching..." : "📊 Get Forecast"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <span>
            Generating AI forecast for {form.commodity} in {form.district}...
          </span>
        </div>
      )}

      {data && (
        <>
          {/* RECOMMENDATION BOX */}
          {rec && (
            <div
              className={`recommendation-box ${rec.action === "SELL" ? "sell" : "wait"}`}
            >
              <div className="rec-icon">
                {rec.action === "SELL" ? "✅" : "⏳"}
              </div>
              <div className="rec-content">
                <h3>
                  {rec.action === "SELL"
                    ? "SELL NOW — Prices are at peak!"
                    : `WAIT ${rec.sell_after_days} days for best price`}
                </h3>
                <p>
                  Best market: <strong>{rec.best_market}</strong> • Expected
                  price:{" "}
                  <strong>
                    ₹{rec.expected_price?.toLocaleString("en-IN")}/q
                  </strong>
                  {rec.expected_profit && (
                    <>
                      {" "}
                      • Profit:{" "}
                      <strong style={{ color: "var(--green-main)" }}>
                        +₹{rec.expected_profit}
                      </strong>
                    </>
                  )}
                </p>
                {rec.explanation?.length > 0 && (
                  <ul>
                    {rec.explanation.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* MARKET TABS */}
          <div className="card">
            <div className="card-title">
              📈 7-Day Forecast — {form.commodity}
            </div>
            <div style={styles.marketTabs}>
              {markets.map((m) => (
                <button
                  key={m}
                  style={{
                    ...styles.marketTab,
                    ...(activeMarket === m ? styles.marketTabActive : {}),
                  }}
                  onClick={() => setActiveMarket(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* PRICE BARS */}
            {prices.length > 0 &&
              (() => {
                const maxP = Math.max(...prices);
                const minP = Math.min(...prices);
                return (
                  <div style={{ marginTop: "1rem" }}>
                    {prices.map((p, i) => {
                      const pct =
                        maxP > minP ? ((p - minP) / (maxP - minP)) * 100 : 50;
                      const isToday = i === 0;
                      const isPeak = p === maxP;
                      return (
                        <div key={i} style={styles.barRow}>
                          <div style={styles.barDate}>
                            <span style={styles.barDayLabel}>{DAYS[i]}</span>
                            <span style={styles.barDateLabel}>{dates[i]}</span>
                          </div>
                          <div className="price-bar-wrap" style={{ flex: 1 }}>
                            <div className="price-bar-track">
                              <div
                                className="price-bar-fill"
                                style={{
                                  width: `${Math.max(pct, 8)}%`,
                                  background: isPeak
                                    ? "linear-gradient(90deg, #00c853, #1b5e20)"
                                    : undefined,
                                }}
                              />
                            </div>
                          </div>
                          <div style={styles.barPrice}>
                            ₹
                            {p.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                            /q
                            {isPeak && (
                              <span style={styles.peakBadge}>Peak</span>
                            )}
                            {isToday && (
                              <span style={styles.todayBadge}>Today</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
          </div>

          {/* FORECAST CARDS */}
          <div style={{ marginTop: "1.25rem" }}>
            <div className="card-title" style={{ marginBottom: "0.75rem" }}>
              📅 Day-wise Summary
            </div>
            <div className="forecast-grid">
              {prices.map((p, i) => {
                const prev = i > 0 ? prices[i - 1] : p;
                const diff = p - prev;
                const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : "0.0";
                return (
                  <div
                    key={i}
                    className={`forecast-day-card ${i === 0 ? "today" : ""}`}
                  >
                    <div className="forecast-date">{dates[i]}</div>
                    <div className="forecast-price">
                      ₹{Math.round(p).toLocaleString("en-IN")}
                    </div>
                    {i > 0 && (
                      <div
                        className={`forecast-change ${diff >= 0 ? "up" : "down"}`}
                      >
                        {diff >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
                      </div>
                    )}
                    {i === 0 && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--green-main)",
                          fontWeight: 600,
                        }}
                      >
                        Current
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  errorBox: {
    background: "#fce4ec",
    border: "1px solid #ef9a9a",
    borderRadius: "var(--radius)",
    padding: "0.85rem 1.1rem",
    color: "var(--red)",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  marketTabs: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  marketTab: {
    padding: "5px 14px",
    borderRadius: "20px",
    border: "1.5px solid var(--gray-300)",
    background: "white",
    cursor: "pointer",
    fontSize: "0.83rem",
    fontWeight: 600,
    transition: "all 0.2s",
    fontFamily: "'Noto Sans', sans-serif",
  },
  marketTabActive: {
    background: "var(--green-main)",
    color: "white",
    borderColor: "var(--green-main)",
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.55rem 0",
    borderBottom: "1px solid var(--gray-100)",
  },
  barDate: { display: "flex", flexDirection: "column", minWidth: "70px" },
  barDayLabel: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--gray-700)",
  },
  barDateLabel: { fontSize: "0.72rem", color: "var(--gray-500)" },
  barPrice: {
    minWidth: "130px",
    textAlign: "right",
    fontFamily: "'Baloo 2', cursive",
    fontWeight: 700,
    color: "var(--green-dark)",
    fontSize: "0.92rem",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    justifyContent: "flex-end",
  },
  peakBadge: {
    background: "var(--green-pale)",
    color: "var(--green-dark)",
    fontSize: "0.67rem",
    padding: "2px 6px",
    borderRadius: "10px",
    fontFamily: "'Noto Sans', sans-serif",
    fontWeight: 700,
  },
  todayBadge: {
    background: "#e3f2fd",
    color: "var(--blue)",
    fontSize: "0.67rem",
    padding: "2px 6px",
    borderRadius: "10px",
    fontFamily: "'Noto Sans', sans-serif",
    fontWeight: 700,
  },
};
