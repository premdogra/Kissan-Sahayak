import { useState } from "react";
import "../pages/Dashboard.css";

const BASE = "http://localhost:5000";
const COMMODITIES = [
  "Potato",
  "Wheat",
  "Tomato",
  "Onion",
  "Banana",
  "Orange",
  "Rice",
  "Maize",
];
const STATES = ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan"];
const DISTRICTS = {
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Khanna"],
  Haryana: ["Gurugram", "Hisar", "Rohtak"],
  "Uttar Pradesh": ["Lucknow", "Agra", "Kanpur"],
  Rajasthan: ["Jaipur", "Jodhpur"],
};

export default function MandiComparison() {
  const [form, setForm] = useState({
    commodity: "Potato",
    state: "Punjab",
    district: "Ludhiana",
    transport_cost: 50,
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (k, v) => {
    const u = { ...form, [k]: v };
    if (k === "state") u.district = DISTRICTS[v]?.[0] || "";
    setForm(u);
  };

  const fetchComparison = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`${BASE}/api/mandi/comparison`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          transport_cost: Number(form.transport_cost),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const sortedList = data?.comparison
    ? [...data.comparison].sort((a, b) => b.net_price - a.net_price)
    : [];

  return (
    <div>
      <div className="page-header">
        <h1>⚖️ Mandi Comparison</h1>
        <p>Compare mandis to find the best net price after transport costs</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">🔍 Configure Search</div>
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
        <div className="form-group" style={{ maxWidth: "260px" }}>
          <label className="form-label">Transport Cost (₹/km)</label>
          <input
            className="form-input"
            type="number"
            value={form.transport_cost}
            onChange={(e) => handle("transport_cost", e.target.value)}
            placeholder="50"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchComparison}
          disabled={loading}
        >
          {loading ? "⏳ Comparing..." : "⚖️ Compare Mandis"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <span>Analyzing mandis near {form.district}...</span>
        </div>
      )}

      {data && (
        <>
          {/* BEST MANDI HIGHLIGHT */}
          {data.best_mandi && (
            <div style={styles.bestBanner}>
              <div style={styles.bestIcon}>🏆</div>
              <div>
                <div style={styles.bestTitle}>
                  Best Mandi: {data.best_mandi.market}
                </div>
                <div style={styles.bestSub}>
                  Net Price:{" "}
                  <strong>
                    ₹{data.best_mandi.net_price?.toLocaleString("en-IN")}/q
                  </strong>{" "}
                  • Distance: <strong>{data.best_mandi.distance} km</strong>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title">📋 All Mandis — {form.commodity}</div>
            <div className="comparison-list">
              {sortedList.map((item, i) => {
                const isBest = item.market === data.best_mandi?.market;
                return (
                  <div
                    key={i}
                    className={`comparison-item ${isBest ? "best" : ""}`}
                  >
                    <div className="comp-rank">#{i + 1}</div>
                    <div className="comp-info">
                      <div className="comp-market">
                        {item.market}
                        {isBest && (
                          <span
                            className="badge badge-green"
                            style={{ marginLeft: "8px" }}
                          >
                            Best
                          </span>
                        )}
                      </div>
                      <div className="comp-meta">
                        📍 {item.distance} km away &nbsp;•&nbsp; 🚛 Transport: ₹
                        {item.transport_cost?.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="comp-price">
                      <div className="comp-price-main">
                        ₹{item.net_price?.toLocaleString("en-IN")}/q
                      </div>
                      <div className="comp-price-net">
                        Gross: ₹{item.price?.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUMMARY TABLE */}
          <div className="card" style={{ marginTop: "1.25rem" }}>
            <div className="card-title">📊 Detailed Breakdown</div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mandi</th>
                    <th>Market Price</th>
                    <th>Distance</th>
                    <th>Transport Cost</th>
                    <th>Net Price</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedList.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{item.market}</strong>
                      </td>
                      <td>₹{item.price?.toLocaleString("en-IN")}/q</td>
                      <td>{item.distance} km</td>
                      <td>₹{item.transport_cost?.toLocaleString("en-IN")}</td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: i === 0 ? "var(--green-dark)" : "inherit",
                        }}
                      >
                        ₹{item.net_price?.toLocaleString("en-IN")}/q
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  bestBanner: {
    background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem 1.5rem",
    marginBottom: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    color: "white",
  },
  bestIcon: { fontSize: "2.5rem" },
  bestTitle: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "1.2rem",
    fontWeight: 800,
  },
  bestSub: { fontSize: "0.88rem", opacity: 0.88, marginTop: "0.25rem" },
};
