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
  "Mustard",
];
const MARKETS = [
  "Ludhiana APMC",
  "Amritsar APMC",
  "Jalandhar APMC",
  "Khanna APMC",
  "Samrala APMC",
  "Sahnewal APMC",
  "Patiala APMC",
];

export default function MandiPrice() {
  const [form, setForm] = useState({
    market: "Ludhiana APMC",
    commodity: "Banana",
    state: "Punjab",
    district: "Ludhiana",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrice = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams(form);
      const res = await fetch(`${BASE}/api/mandi/price?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const item = Array.isArray(data) ? data[0] : data;
  const isNA = item?.message;

  return (
    <div>
      <div className="page-header">
        <h1>💰 Live Mandi Price</h1>
        <p>
          Get today's modal, minimum and maximum price for any commodity at a
          specific mandi
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">🔍 Search Price</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Market / Mandi</label>
            <select
              className="form-select"
              value={form.market}
              onChange={(e) =>
                setForm((f) => ({ ...f, market: e.target.value }))
              }
            >
              {MARKETS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Commodity</label>
            <select
              className="form-select"
              value={form.commodity}
              onChange={(e) =>
                setForm((f) => ({ ...f, commodity: e.target.value }))
              }
            >
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">State (Optional)</label>
            <input
              className="form-input"
              value={form.state}
              onChange={(e) =>
                setForm((f) => ({ ...f, state: e.target.value }))
              }
              placeholder="e.g. Punjab"
            />
          </div>
          <div className="form-group">
            <label className="form-label">District (Optional)</label>
            <input
              className="form-input"
              value={form.district}
              onChange={(e) =>
                setForm((f) => ({ ...f, district: e.target.value }))
              }
              placeholder="e.g. Ludhiana"
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchPrice}
          disabled={loading}
        >
          {loading ? "⏳ Fetching..." : "💰 Get Live Price"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <span>Fetching price from {form.market}...</span>
        </div>
      )}

      {data && (
        <>
          {isNA ? (
            <div className="empty-state card">
              <div className="empty-icon">📭</div>
              <h3>Not available today</h3>
              <p>
                {form.commodity} is not being traded at {form.market} today.
              </p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Try checking the price history for recent records.
              </p>
            </div>
          ) : (
            item && (
              <>
                {/* PRICE HERO */}
                <div style={styles.priceHero}>
                  <div style={styles.heroLeft}>
                    <div style={styles.heroMarket}>🏪 {item.market}</div>
                    <div style={styles.heroCommodity}>{item.commodity}</div>
                    <div style={styles.heroDate}>📅 {item.arrival_date}</div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      {item.variety && (
                        <span className="badge badge-green">
                          {item.variety}
                        </span>
                      )}
                      {item.grade && (
                        <span className="badge badge-blue">{item.grade}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.heroRight}>
                    <div style={styles.heroLabel}>Modal Price</div>
                    <div style={styles.heroPrice}>
                      ₹{item.modal_price?.toLocaleString("en-IN")}
                    </div>
                    <div style={styles.heroUnit}>per quintal</div>
                  </div>
                </div>

                {/* MIN / MAX CARDS */}
                <div className="two-col" style={{ marginBottom: "1.25rem" }}>
                  <div
                    className="card"
                    style={{
                      background: "#e8f5e9",
                      border: "1px solid #a5d6a7",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--green-dark)",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      📉 MINIMUM PRICE
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "var(--green-dark)",
                      }}
                    >
                      ₹{item.min_price?.toLocaleString("en-IN")}
                    </div>
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
                    >
                      per quintal
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      background: "#fff3e0",
                      border: "1px solid #ffcc02",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#e65100",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      📈 MAXIMUM PRICE
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "#e65100",
                      }}
                    >
                      ₹{item.max_price?.toLocaleString("en-IN")}
                    </div>
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
                    >
                      per quintal
                    </div>
                  </div>
                </div>

                {/* PRICE RANGE VISUAL */}
                <div className="card">
                  <div className="card-title">📊 Price Range Visualization</div>
                  <div style={styles.rangeBar}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--gray-500)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Min: ₹{item.min_price?.toLocaleString("en-IN")} — Max: ₹
                      {item.max_price?.toLocaleString("en-IN")}
                    </div>
                    <div style={styles.rangeTrack}>
                      {item.min_price &&
                        item.max_price &&
                        item.modal_price &&
                        (() => {
                          const range = item.max_price - item.min_price;
                          const modalPct =
                            range > 0
                              ? ((item.modal_price - item.min_price) / range) *
                                100
                              : 50;
                          return (
                            <>
                              <div
                                style={{ ...styles.rangeFill, width: "100%" }}
                              />
                              <div
                                style={{
                                  ...styles.rangeMarker,
                                  left: `${modalPct}%`,
                                }}
                                title={`Modal: ₹${item.modal_price}`}
                              />
                            </>
                          );
                        })()}
                    </div>
                    <div style={styles.rangeLabels}>
                      <span>
                        Min ₹{item.min_price?.toLocaleString("en-IN")}
                      </span>
                      <span
                        style={{ fontWeight: 700, color: "var(--green-dark)" }}
                      >
                        Modal ₹{item.modal_price?.toLocaleString("en-IN")}
                      </span>
                      <span>
                        Max ₹{item.max_price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )
          )}
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
    padding: "0.85rem",
    color: "var(--red)",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  priceHero: {
    background: "linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)",
    borderRadius: "var(--radius-lg)",
    padding: "1.75rem 2rem",
    marginBottom: "1.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heroLeft: {},
  heroMarket: { fontSize: "0.9rem", opacity: 0.85, marginBottom: "0.25rem" },
  heroCommodity: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "1.8rem",
    fontWeight: 800,
  },
  heroDate: { fontSize: "0.83rem", opacity: 0.8, marginTop: "0.25rem" },
  heroRight: { textAlign: "right" },
  heroLabel: {
    fontSize: "0.78rem",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heroPrice: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "2.5rem",
    fontWeight: 800,
    lineHeight: 1.1,
  },
  heroUnit: { fontSize: "0.85rem", opacity: 0.8 },
  rangeBar: { marginTop: "0.5rem" },
  rangeTrack: {
    height: "16px",
    background: "linear-gradient(90deg, #a5d6a7, #2e7d32)",
    borderRadius: "8px",
    position: "relative",
    marginBottom: "0.5rem",
  },
  rangeFill: { height: "100%", borderRadius: "8px" },
  rangeMarker: {
    position: "absolute",
    top: "-4px",
    width: "24px",
    height: "24px",
    background: "white",
    border: "3px solid var(--green-dark)",
    borderRadius: "50%",
    transform: "translateX(-50%)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "var(--gray-500)",
  },
};
